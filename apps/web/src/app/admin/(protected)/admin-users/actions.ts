"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/admin-audit-log";
import type { AdminRole } from "@/lib/supabase/server-session";

const ADMIN_ROLES: AdminRole[] = ["super_admin", "admin", "moderator"];

/** Same lookup as scripts/promote-admin.mjs — kept in sync so both paths behave identically. */
async function findUserByEmail(supabase: ReturnType<typeof createServiceRoleClient>, targetEmail: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) break; // last page
  }
  return null;
}

async function assertNotLastSuperAdmin(supabase: ReturnType<typeof createServiceRoleClient>, targetId: string) {
  const { data: target, error } = await supabase.from("admin_users").select("role").eq("id", targetId).single();
  if (error || !target) throw new Error("Admin not found");
  if (target.role !== "super_admin") return;

  const { count } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin");
  if ((count ?? 0) <= 1) throw new Error("Can't remove the last super admin.");
}

export async function addAdmin(formData: FormData) {
  const admin = await requireRole("super_admin");

  const email = String(formData.get("email") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "admin") as AdminRole;

  if (!email || !displayName) throw new Error("Email and display name are required");
  if (!ADMIN_ROLES.includes(role)) throw new Error("Invalid role");

  const supabase = createServiceRoleClient();
  const user = await findUserByEmail(supabase, email);
  if (!user) {
    throw new Error(
      `No account found for ${email}. Ask them to visit /admin/login and request a magic link first (they don't need to click it), then try again.`,
    );
  }

  const { error } = await supabase
    .from("admin_users")
    .upsert({ id: user.id, display_name: displayName, role }, { onConflict: "id" });
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.userId,
    action: "admin_user_granted",
    entityType: "admin_user",
    entityId: user.id,
    metadata: { email, role },
  });
  revalidatePath("/admin/admin-users");
}

export async function updateAdminRole(formData: FormData) {
  const admin = await requireRole("super_admin");

  const targetId = String(formData.get("adminUserId"));
  const role = String(formData.get("role")) as AdminRole;
  if (!ADMIN_ROLES.includes(role)) throw new Error("Invalid role");

  const supabase = createServiceRoleClient();
  await assertNotLastSuperAdmin(supabase, targetId);

  const { error } = await supabase.from("admin_users").update({ role }).eq("id", targetId);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.userId,
    action: "admin_user_role_changed",
    entityType: "admin_user",
    entityId: targetId,
    metadata: { role },
  });
  revalidatePath("/admin/admin-users");
}

export async function revokeAdmin(formData: FormData) {
  const admin = await requireRole("super_admin");

  const targetId = String(formData.get("adminUserId"));
  if (targetId === admin.userId) {
    throw new Error("You can't revoke your own access — ask another super admin.");
  }

  const supabase = createServiceRoleClient();
  await assertNotLastSuperAdmin(supabase, targetId);

  // Removes dashboard access only — the underlying auth.users account (and
  // any linked member profile) is left untouched.
  const { error } = await supabase.from("admin_users").delete().eq("id", targetId);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.userId,
    action: "admin_user_revoked",
    entityType: "admin_user",
    entityId: targetId,
  });
  revalidatePath("/admin/admin-users");
}
