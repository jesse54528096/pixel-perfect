import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UploadView from "@/views/UploadView";

export const metadata: Metadata = {
  title: "Upload — Video Speed Reader",
  description: "Submit a video and get its transcript.",
};

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // RLS already limits rows to this user; the filter keeps the intent explicit.
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, created_at, video_source_url, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", user.id)
    .maybeSingle();

  return <UploadView jobs={jobs ?? []} balance={Number(profile?.credits_balance ?? 0)} />;
}
