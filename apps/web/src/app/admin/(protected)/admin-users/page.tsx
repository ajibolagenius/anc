import { redirect } from "next/navigation";
import { UserPlusIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { Badge } from "@/components/ui/badge";
import { adminRoleTone, adminRoleLabel } from "@/components/ui/status";
import { addAdmin, updateAdminRole, revokeAdmin } from "./actions";

const ROLE_OPTIONS = ["super_admin", "admin", "moderator"] as const;

export default async function AdminUsersPage() {
  const admin = await getAdminSession();
  if (admin?.role !== "super_admin") {
    redirect("/admin");
  }

  const supabase = createServiceRoleClient();
  const { data: adminUsers, error } = await supabase
    .from("admin_users")
    .select("id, display_name, role, created_at")
    .order("created_at", { ascending: true });

  const withEmails = await Promise.all(
    (adminUsers ?? []).map(async (row) => {
      const { data } = await supabase.auth.admin.getUserById(row.id);
      return { ...row, email: data.user?.email ?? "—" };
    }),
  );

  const superAdminCount = withEmails.filter((a) => a.role === "super_admin").length;

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">ADMIN USERS</h1>
        <p className="mt-1 text-sm text-muted">
          Super admin only — grant permissions, assign moderation tiers, or revoke dashboard access.
        </p>
      </div>

      {/* Grant Access Form */}
      <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-6 sm:p-7 shadow-xl max-w-xl">
        <div className="flex items-center gap-2">
          <UserPlusIcon className="h-5 w-5 text-arsenal-gold" />
          <h2 className="font-display text-xl tracking-wide text-foreground">GRANT DASHBOARD ACCESS</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          The user must have requested a magic link at <code>/admin/login</code> at least once before they can be added.
        </p>

        <form action={addAdmin} className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="adminEmail" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
              Email Address
            </label>
            <input
              id="adminEmail"
              name="email"
              type="email"
              required
              placeholder="admin@anc.community"
              className="h-10 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="adminName" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Display Name
              </label>
              <input
                id="adminName"
                name="displayName"
                required
                placeholder="e.g. Bukayo S."
                className="h-10 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="adminRole" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Role
              </label>
              <select
                id="adminRole"
                name="role"
                defaultValue="admin"
                className="h-10 w-full rounded-xl border border-surface-border bg-white/5 px-3 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r} className="bg-arsenal-navy-deep text-foreground">
                    {adminRoleLabel(r as any)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2">
            <button
              type="submit"
              className="flex h-10 items-center justify-center rounded-xl bg-arsenal-red px-6 text-xs font-bold text-white transition-colors hover:bg-arsenal-red-bright"
            >
              Grant Access
            </button>
          </div>
        </form>
      </div>

      {error && <p className="mt-6 text-xs text-arsenal-red-bright">{error.message}</p>}

      {/* Admin Users Table */}
      <div className="mt-10 overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Since</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {withEmails.map((row) => {
              const isSelf = row.id === admin.userId;
              const isLastSuperAdmin = row.role === "super_admin" && superAdminCount <= 1;

              return (
                <tr key={row.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {row.display_name} {isSelf && <span className="ml-1 text-xs text-muted">(you)</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted">{row.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={adminRoleTone(row.role as any)}>
                      {adminRoleLabel(row.role as any)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted">
                    {new Date(row.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={updateAdminRole} className="flex items-center gap-1.5">
                        <input type="hidden" name="adminUserId" value={row.id} />
                        <select
                          name="role"
                          defaultValue={row.role}
                          disabled={isLastSuperAdmin}
                          className="h-8 rounded-lg border border-surface-border bg-white/5 px-2 text-xs text-foreground focus:outline-none disabled:opacity-40"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r} className="bg-arsenal-navy-deep text-foreground">
                              {adminRoleLabel(r as any)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={isLastSuperAdmin}
                          className="h-8 rounded-lg bg-white/10 px-2.5 text-xs font-bold text-foreground transition-colors hover:bg-white/20 disabled:opacity-40"
                        >
                          Update
                        </button>
                      </form>

                      <form action={revokeAdmin}>
                        <input type="hidden" name="adminUserId" value={row.id} />
                        <button
                          type="submit"
                          disabled={isSelf || isLastSuperAdmin}
                          className="h-8 rounded-lg border border-surface-border px-2.5 text-xs font-bold text-arsenal-red-bright transition-colors hover:bg-arsenal-red-bright/10 disabled:opacity-40"
                        >
                          Revoke
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
