import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { BirthdayCalendar } from "./birthday-calendar";
import { AutomationTestButtons } from "./_test-buttons";

export default async function AutomationsPage() {
  const admin = await getAdminSession();
  const supabase = createServiceRoleClient();

  // 1. Fetch approved members with birthdays
  const { data: members } = await supabase
    .from("members")
    .select("id, full_name, birthday_day, birthday_month, state_of_residence")
    .eq("registration_status", "approved");

  const memberBirthdays = (members ?? []).map((m) => ({
    id: m.id,
    fullName: m.full_name,
    birthdayDay: m.birthday_day,
    birthdayMonth: m.birthday_month,
    stateOfResidence: m.state_of_residence,
  }));

  // 2. Fetch notifications
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
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">AUTOMATIONS</h1>
          <p className="mt-1 text-sm text-muted">
            Automated birthday greetings, daily digest broadcasts, and scheduled jobs.
          </p>
        </div>

        {admin?.role === "super_admin" && <AutomationTestButtons />}
      </div>

      {/* Birthday Calendar */}
      <div className="mt-8">
        <BirthdayCalendar members={memberBirthdays} />
      </div>

      {/* 2-Column Logs: Birthday & Digest Log */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xl">
          <h2 className="font-display text-xl tracking-wide text-foreground">RECENT BIRTHDAY GREETINGS</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-surface-border divide-y divide-surface-border">
            {recentBirthdays?.map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 text-xs">
                <div>
                  <p className="font-semibold text-foreground">{nameByMemberId.get(n.member_id) ?? "Member"}</p>
                  <p className="text-[11px] text-muted capitalize">via {n.channel} · Status: {n.status}</p>
                </div>
                <span className="text-[11px] text-muted">
                  {new Date(n.sent_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}

            {(recentBirthdays?.length ?? 0) === 0 && (
              <p className="p-6 text-center text-xs text-muted">No birthday greetings sent yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xl">
          <h2 className="font-display text-xl tracking-wide text-foreground">RECENT NEWS DIGESTS</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-surface-border divide-y divide-surface-border">
            {recentDigests?.map((d) => (
              <div key={d.digest_date} className="flex items-center justify-between p-3 text-xs">
                <div>
                  <p className="font-semibold text-foreground">Digest {d.digest_date}</p>
                  <p className="text-[11px] text-muted capitalize">Status: {d.status} {d.error ? `(${d.error})` : ""}</p>
                </div>
                <span className="text-[11px] text-muted">
                  {new Date(d.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}

            {(recentDigests?.length ?? 0) === 0 && (
              <p className="p-6 text-center text-xs text-muted">No news digests broadcast yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Action Audit Log */}
      <div className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-foreground">ADMIN AUDIT TRAIL</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5">Admin</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {auditLog?.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {a.admin_id ? (adminNameById.get(a.admin_id) ?? "—") : "System"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted font-mono">{a.action}</td>
                  <td className="px-5 py-3.5 text-xs text-muted capitalize">{a.entity_type}</td>
                  <td className="px-5 py-3.5 text-right text-xs text-muted">
                    {new Date(a.created_at).toLocaleString("en-NG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(auditLog?.length ?? 0) === 0 && (
            <p className="p-8 text-center text-xs text-muted">No admin actions logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
