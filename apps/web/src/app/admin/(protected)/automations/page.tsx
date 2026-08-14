import { createServiceRoleClient } from "@/lib/supabase/server";
import { AutomationTestButtons } from "./_test-buttons";

export default async function AutomationsPage() {
  const supabase = createServiceRoleClient();

  const { data: recentBirthdays } = await supabase
    .from("birthday_notifications")
    .select("member_id, channel, status, greeted_year, sent_at")
    .order("sent_at", { ascending: false })
    .limit(10);
  const birthdayMemberIds = [...new Set((recentBirthdays ?? []).map((n) => n.member_id))];
  const { data: birthdayMembers } = birthdayMemberIds.length
    ? await supabase.from("members").select("id, full_name").in("id", birthdayMemberIds)
    : { data: [] };
  const nameByMemberId = new Map((birthdayMembers ?? []).map((m) => [m.id, m.full_name]));

  const { data: recentDigests } = await supabase
    .from("news_digest_log")
    .select("digest_date, status, error, created_at")
    .order("digest_date", { ascending: false })
    .limit(10);

  const { data: auditLog } = await supabase
    .from("admin_audit_log")
    .select("id, admin_id, action, entity_type, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  const adminIds = [...new Set((auditLog ?? []).map((a) => a.admin_id).filter((id): id is string => id !== null))];
  const { data: admins } = adminIds.length
    ? await supabase.from("admin_users").select("id, display_name").in("id", adminIds)
    : { data: [] };
  const adminNameById = new Map((admins ?? []).map((a) => [a.id, a.display_name]));

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Automations</h1>
      <p className="mt-2 text-sm text-muted">
        Daily crons: birthdays at 07:00 WAT, news digest at 08:00 WAT. Use the test buttons below to run either job right now
        for QA — both are idempotent, so a test-send today won't double-send when the real cron fires later.
      </p>

      <AutomationTestButtons />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-foreground/90">Recent birthday notifications</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-surface-border">
            <table className="w-full text-left text-sm">
              <tbody>
                {recentBirthdays?.map((n, i) => (
                  <tr key={i} className="border-b border-surface-border/60 last:border-0">
                    <td className="px-4 py-2 text-foreground">{nameByMemberId.get(n.member_id) ?? "—"}</td>
                    <td className="px-4 py-2 text-muted capitalize">{n.channel}</td>
                    <td className="px-4 py-2 text-muted capitalize">{n.status}</td>
                    <td className="px-4 py-2 text-muted">{new Date(n.sent_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(recentBirthdays?.length ?? 0) === 0 && <p className="px-4 py-6 text-center text-sm text-muted">Nothing sent yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-foreground/90">Recent news digests</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-surface-border">
            <table className="w-full text-left text-sm">
              <tbody>
                {recentDigests?.map((d) => (
                  <tr key={d.digest_date} className="border-b border-surface-border/60 last:border-0">
                    <td className="px-4 py-2 text-foreground">{d.digest_date}</td>
                    <td className="px-4 py-2 text-muted capitalize">{d.status}</td>
                    <td className="px-4 py-2 text-muted">{d.error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(recentDigests?.length ?? 0) === 0 && <p className="px-4 py-6 text-center text-sm text-muted">Nothing sent yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium text-foreground/90">Admin action log</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {auditLog?.map((a) => (
                <tr key={a.id} className="border-b border-surface-border/60 last:border-0">
                  <td className="px-4 py-3 text-foreground">{a.admin_id ? (adminNameById.get(a.admin_id) ?? "—") : "—"}</td>
                  <td className="px-4 py-3 text-muted">{a.action.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-muted">{a.entity_type}</td>
                  <td className="px-4 py-3 text-muted">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(auditLog?.length ?? 0) === 0 && <p className="px-4 py-6 text-center text-sm text-muted">No admin actions logged yet.</p>}
        </div>
      </div>
    </div>
  );
}
