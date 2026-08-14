import "server-only";
import { getAdminSession, type AdminRole, type AdminSession } from "@/lib/supabase/server-session";

/** Re-verifies the admin session inside a server action — never trust that the UI gate alone kept a non-admin out. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) throw new Error("Not authorized");
  return admin;
}

/** Ranks each tier so a higher role can do everything a lower one can. */
const ROLE_RANK: Record<AdminRole, number> = {
  moderator: 0,
  admin: 1,
  super_admin: 2,
};

/**
 * Re-verifies the admin session AND that their role tier meets `minRole`.
 * Use this instead of requireAdmin() for any action that shouldn't be
 * available to every admin tier (e.g. requireRole("super_admin") for
 * mass-communication or payout-adjacent actions).
 */
export async function requireRole(minRole: AdminRole): Promise<AdminSession> {
  const admin = await requireAdmin();
  if (ROLE_RANK[admin.role] < ROLE_RANK[minRole]) {
    throw new Error("Not authorized");
  }
  return admin;
}
