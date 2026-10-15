import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreditsSuccessView from "@/views/CreditsSuccessView";

export const metadata: Metadata = {
  title: "Payment received — Video Speed Reader",
};

// UX only: the Stripe webhook is what grants the credits, never this page.
export default async function CreditsSuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", user.id)
    .maybeSingle();

  return <CreditsSuccessView balance={Number(profile?.credits_balance ?? 0)} />;
}
