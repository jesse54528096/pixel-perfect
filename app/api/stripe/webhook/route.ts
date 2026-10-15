import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

// Stripe calls this route, not the user: there's no session cookie, so it uses the
// service-role client. middleware.ts excludes this path so the body reaches us untouched.
export async function POST(req: Request) {
  const body = await req.text(); // raw body: the signature is over these exact bytes
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("no signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env["STRIPE_WEBHOOK_SECRET"]!);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return new NextResponse("invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, unpaid: true });
  }

  const userId = session.metadata?.["user_id"];
  const credits = Number(session.metadata?.["credits"]);
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!userId || !credits || !paymentIntentId) {
    console.error("missing required fields", { userId, credits, paymentIntentId });
    return new NextResponse("missing metadata", { status: 400 });
  }

  const svc = createServiceClient();

  // 1. Ledger row first; the unique index on stripe_payment_intent_id makes retries no-ops.
  const { error: insertErr } = await svc.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    type: "purchase",
    description: `Purchased ${credits} credits`,
    stripe_payment_intent_id: paymentIntentId,
  });
  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("insert failed", insertErr);
    return new NextResponse("db insert failed", { status: 500 });
  }

  // 2. Balance is derived from the ledger.
  const { data: profile } = await svc.from("profiles").select("credits_balance").eq("id", userId).single();
  const newBalance = Number(profile?.credits_balance ?? 0) + credits;
  const { error: updateErr } = await svc.from("profiles").update({ credits_balance: newBalance }).eq("id", userId);
  if (updateErr) {
    console.error("balance update failed", updateErr);
    return new NextResponse("balance update failed", { status: 500 });
  }

  return NextResponse.json({ received: true, credited: credits });
}
