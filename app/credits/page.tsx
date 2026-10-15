import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreditsView from "@/views/CreditsView";

export const metadata: Metadata = {
  title: "Credits — Video Speed Reader",
  description: "Your credit balance, credit packs and history.",
};

export default async function CreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: profile }, { data: products }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("credits_balance").eq("id", user.id).maybeSingle(),
    supabase
      .from("credit_products")
      .select("id, name, credits, price_usd")
      .eq("active", true)
      .order("price_usd"),
    supabase
      .from("credit_transactions")
      .select("id, amount, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <CreditsView
      balance={Number(profile?.credits_balance ?? 0)}
      products={products ?? []}
      transactions={transactions ?? []}
    />
  );
}
