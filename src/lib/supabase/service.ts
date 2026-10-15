import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Service-role client (Supabase Secret key). Bypasses RLS: only use it server-side,
// for callers that aren't the signed-in user (Stripe webhooks) or after checking auth.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env["SUPABASE_SECRET_KEY"]!,
  );
}
