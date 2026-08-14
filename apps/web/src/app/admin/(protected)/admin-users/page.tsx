import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { inputClassName } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { ShieldIcon } from "@/components/icons";
import { addAdmin, updateAdminRole, revokeAdmin } from "./actions";

const ROLE_OPTIONS = ["super_admin", "admin", "moderator"] as const;

export default async function AdminUsersPage() {
  const admin = await getAdminSession();
  // Page-level gate, not just a hidden nav link — this lists every admin's
  // email, so a direct link should 404-equivalent redirect for non-supers.
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
    <div className="max-w-3xl">
      <PageHeader icon={ShieldIcon} title="Admin Users" subtitle="Super admin only — grant, retier, or revoke dashboard access." />

      <form action={addAdmin} className="mt-6 flex flex-col gap-4 rounded-2xl border border-surface-border p-5 max-w-xl">
        <h2 className="text-sm font-medium text-foreground/90">Grant access</h2>
        <p className="text-xs text-muted">
          The person must have visited <code>/admin/login</code> and requested a magic link at least once (they
          don&apos;t need to click it) before they can be granted access here.
        </p>
        <input name="email" type="email" required placeholder="Email" className={inputClassName} />
        <input name="displayName" required placeholder="Display name" className={inputClassName} />
        <select name="role" defaultValue="admin" className={inputClassName}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="self-start rounded-full bg-arsenal-red px-6 py-2.5 text-sm font-medium text-white hover:scale-[1.02]"
        >
          Grant access
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-arsenal-red-bright">{error.message}</p>}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-surface-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Since</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withEmails.map((row) => {
              const isSelf = row.id === admin.userId;
              const isLastSuperAdmin = row.role === "super_admin" && superAdminCount <= 1;
              return (
                <tr key={row.id} className="border-b border-surface-border/60 last:border-0">
                  <td className="px-4 py-3 text-foreground">
                    {row.display_name} {isSelf && <span className="text-xs text-muted">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">{row.email}</td>
                  <td className="px-4 py-3">
                    <form action={updateAdminRole} className="flex items-center gap-1.5">
                      <input type="hidden" name="adminUserId" value={row.id} />
                      <select
                        name="role"
                        defaultValue={row.role}
                        disabled={isLastSuperAdmin}
                        className="rounded-md border border-surface-border bg-background/60 px-1.5 py-1 text-xs capitalize"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={isLastSuperAdmin}
                        className="rounded-md border border-surface-border px-2.5 py-1 text-xs text-muted hover:border-arsenal-gold hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(row.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <form action={revokeAdmin}>
                      <input type="hidden" name="adminUserId" value={row.id} />
                      <button
                        type="submit"
                        disabled={isSelf || isLastSuperAdmin}
                        className="rounded-md border border-surface-border px-2.5 py-1 text-xs text-muted hover:border-arsenal-red-bright hover:text-arsenal-red-bright disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Revoke
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {withEmails.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">No admin users yet.</p>}
      </div>
    </div>
  );
}
