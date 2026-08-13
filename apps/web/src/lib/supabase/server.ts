import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-only, bypasses RLS. Used for the
 * registration insert (and, later, every admin/cron/newsletter/giveaway
 * write path). Never import this from a client component.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
