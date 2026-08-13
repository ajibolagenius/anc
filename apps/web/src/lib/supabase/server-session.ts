import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Cookie-aware Supabase client for reading/refreshing the current user's
 * auth session — respects RLS as that user. This is deliberately separate
 * from the service-role client (lib/supabase/server.ts): that one bypasses
 * RLS for privileged writes, this one answers "who is logged in right now."
 */
export async function createSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component that can't set cookies — the
            // middleware refreshes the session instead, so this is safe to ignore.
          }
        },
      },
    },
  );
}

export type AdminSession = {
  userId: string;
  email: string;
  displayName: string;
  role: "super_admin" | "admin";
};

/**
 * Returns the current admin's session, or null if not signed in or not an
 * admin. Uses the RLS-scoped session client (admin_users_select_own policy
 * lets a user read only their own row) rather than the service-role client —
 * this check should never see more than "is it me."
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSessionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id, display_name, role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!adminRow) return null;

  return {
    userId: userData.user.id,
    email: userData.user.email ?? "",
    displayName: adminRow.display_name,
    role: adminRow.role as AdminSession["role"],
  };
}

export type MemberSession = {
  userId: string;
  memberId: string;
  fullName: string;
  activityTier: string;
};

/**
 * Returns the current approved member's session, or null if not signed in,
 * not yet linked to a members row, or not yet approved. Uses the RLS-scoped
 * session client (members_select_own policy) — same pattern as
 * getAdminSession(), kept as a separate function since "is an approved
 * member" and "is a platform admin" are deliberately distinct checks.
 */
export async function getMemberSession(): Promise<MemberSession | null> {
  const supabase = await createSessionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: memberRow } = await supabase
    .from("members")
    .select("id, full_name, activity_tier, registration_status")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  if (!memberRow || memberRow.registration_status !== "approved") return null;

  return {
    userId: userData.user.id,
    memberId: memberRow.id,
    fullName: memberRow.full_name,
    activityTier: memberRow.activity_tier,
  };
}
