import "server-only";
import { getAdminSession, type AdminSession } from "@/lib/supabase/server-session";

/** Re-verifies the admin session inside a server action — never trust that the UI gate alone kept a non-admin out. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) throw new Error("Not authorized");
  return admin;
}
