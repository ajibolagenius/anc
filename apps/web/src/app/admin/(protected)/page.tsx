import Link from "next/link";
import { redirect } from "next/navigation";
import { CakeIcon, ClockCounterClockwiseIcon, UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { Card } from "@/components/ui/card";

export default async function AdminHomePage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const supabase = createServiceRoleClient();

  // 1. Fetch member stats
  const { data: members } = await supabase
    .from("members")
    .select("id, full_name, registration_status, activity_tier, birthday_day, birthday_month, created_at");

  const allMembers = members ?? [];
  const totalCount = allMembers.length;
  const pendingCount = allMembers.filter((m) => m.registration_status === "pending").length;
  const approvedMembers = allMembers.filter((m) => m.registration_status === "approved");
  const activeCount = approvedMembers.filter((m) => m.activity_tier === "active").length;
  const activePercent = approvedMembers.length > 0 ? Math.round((activeCount / approvedMembers.length) * 100) : 0;

  // 2. Compute next birthday & this week's birthdays
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const upcomingBirthdays = approvedMembers
    .map((m) => {
      let daysUntil = 0;
      const bMonth = m.birthday_month;
      const bDay = m.birthday_day;

      const thisYearBirthday = new Date(now.getFullYear(), bMonth - 1, bDay);
      if (thisYearBirthday < new Date(now.getFullYear(), currentMonth - 1, currentDay)) {
        thisYearBirthday.setFullYear(now.getFullYear() + 1);
      }
      const diffMs = thisYearBirthday.getTime() - new Date(now.getFullYear(), currentMonth - 1, currentDay).getTime();
      daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

      return {
        ...m,
        daysUntil,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const nextBirthday = upcomingBirthdays[0] ?? null;
  const thisWeekBirthdays = upcomingBirthdays.filter((m) => m.daysUntil <= 7);

  // 3. Fetch recent audit logs / activity
  const { data: auditLogs } = await supabase
    .from("giveaway_audit_log")
    .select("id, event_type, created_at, metadata")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentMembers = allMembers
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">OVERVIEW</h1>
        <p className="mt-1 text-sm text-muted">
          Platform statistics, membership pipeline, and community operations.
        </p>
      </div>

      {/* 4-Stat Grid */}
      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Total members */}
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">TOTAL MEMBERS</p>
          <p className="mt-2 font-display text-3xl tracking-wide text-foreground">{totalCount}</p>
        </Card>

        {/* Stat 2: Pending approval (Highlighted) */}
        <Link href="/admin/members?status=pending" className="block group">
          <Card highlight={pendingCount > 0} className="h-full p-6 transition-all group-hover:border-arsenal-gold">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-arsenal-gold">PENDING APPROVAL</p>
            <p className="mt-2 font-display text-3xl tracking-wide text-arsenal-gold">{pendingCount}</p>
          </Card>
        </Link>

        {/* Stat 3: Active tier */}
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">ACTIVE TIER</p>
          <p className="mt-2 font-display text-3xl tracking-wide text-foreground">{activePercent}%</p>
        </Card>

        {/* Stat 4: Next birthday */}
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">NEXT BIRTHDAY</p>
          <p className="mt-2 font-display text-xl tracking-wide text-foreground truncate">
            {nextBirthday
              ? `${nextBirthday.full_name.split(" ")[0]} · ${nextBirthday.daysUntil === 0 ? "Today 🎉" : `in ${nextBirthday.daysUntil}d`}`
              : "None found"}
          </p>
        </Card>
      </div>

      {/* 2-Column Grid */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* This Week's Birthdays */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CakeIcon className="h-5 w-5 text-arsenal-gold" />
              <h2 className="font-display text-xl text-foreground">THIS WEEK&apos;S BIRTHDAYS</h2>
            </div>
            <Link href="/admin/automations" className="text-xs font-semibold text-arsenal-gold hover:underline">
              Calendar →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-surface-border border-t border-surface-border">
            {thisWeekBirthdays.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{m.full_name}</p>
                  <p className="text-xs text-muted">
                    {new Date(2026, m.birthday_month - 1, m.birthday_day).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-xs font-bold text-arsenal-gold">
                  {m.daysUntil === 0 ? "TODAY" : `in ${m.daysUntil} days`}
                </span>
              </div>
            ))}

            {thisWeekBirthdays.length === 0 && (
              <p className="py-8 text-center text-xs text-muted">No birthdays coming up this week.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockCounterClockwiseIcon className="h-5 w-5 text-arsenal-gold" />
              <h2 className="font-display text-xl text-foreground">RECENT ACTIVITY</h2>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <UsersThreeIcon className="h-4 w-4" />
              <span>Pipeline feed</span>
            </div>
          </div>

          <div className="mt-5 divide-y divide-surface-border border-t border-surface-border">
            {recentMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3 text-sm">
                <div className="min-w-0 pr-4">
                  <p className="truncate font-medium text-foreground">{m.full_name}</p>
                  <p className="text-xs text-muted capitalize">
                    Registered · Status: {m.registration_status}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {new Date(m.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}

            {recentMembers.length === 0 && (
              <p className="py-8 text-center text-xs text-muted">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
