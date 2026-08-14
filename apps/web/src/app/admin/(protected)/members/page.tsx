import Link from "next/link";
import { DownloadSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { ACTIVITY_TIERS, NIGERIAN_STATES } from "@anc/shared";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/ui/confirm-dialog";
import { activityTierTone, registrationStatusTone } from "@/components/ui/status";
import { approveMember, rejectMember } from "./actions";

type SearchParams = {
  status?: string;
  tier?: string;
  state?: string;
  q?: string;
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentStatus = params.status ?? "pending";
  const currentTier = params.tier ?? "";
  const currentState = params.state ?? "";
  const currentQ = params.q ?? "";

  const admin = await getAdminSession();
  const canReview = admin?.role === "admin" || admin?.role === "super_admin";
  const canExport = admin?.role === "super_admin";

  const supabase = createServiceRoleClient();

  // Fetch status counts for tabs
  const { data: countRows } = await supabase
    .from("members")
    .select("registration_status");

  const counts: Record<string, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    all: 0,
  };

  for (const row of countRows ?? []) {
    counts[row.registration_status] = (counts[row.registration_status] ?? 0) + 1;
    counts.all += 1;
  }

  // Fetch filtered members
  let query = supabase
    .from("members")
    .select(
      "id, full_name, whatsapp_number, email, state_of_residence, jersey_size, activity_tier, registration_status, created_at",
    )
    .order("created_at", { ascending: false });

  if (currentStatus !== "all") query = query.eq("registration_status", currentStatus);
  if (currentTier) query = query.eq("activity_tier", currentTier);
  if (currentState) query = query.eq("state_of_residence", currentState);
  if (currentQ) {
    query = query.or(
      `full_name.ilike.%${currentQ}%,email.ilike.%${currentQ}%,whatsapp_number.ilike.%${currentQ}%`,
    );
  }

  const { data: members, error } = await query;
  const exportQuery = new URLSearchParams({
    status: currentStatus,
    tier: currentTier,
    state: currentState,
    q: currentQ,
  }).toString();

  const tabs = [
    { id: "pending", label: `Pending (${counts.pending})` },
    { id: "approved", label: `Approved (${counts.approved})` },
    { id: "rejected", label: `Rejected (${counts.rejected})` },
    { id: "suspended", label: `Suspended (${counts.suspended})` },
    { id: "all", label: `All (${counts.all})` },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">MEMBERS</h1>
          <p className="mt-1 text-sm text-muted">
            Manage registrations, verify activity tiers, and inspect membership records.
          </p>
        </div>

        {canExport && (
          <a
            href={`/admin/members/export?${exportQuery}`}
            className="flex h-10 items-center gap-2 rounded-full border border-surface-border bg-white/5 px-5 text-xs font-bold text-foreground transition-colors hover:border-arsenal-gold hover:bg-white/10"
          >
            <DownloadSimpleIcon className="h-4 w-4" />
            <span>Export CSV</span>
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 border-b border-surface-border text-sm">
        {tabs.map((tab) => {
          const active = currentStatus === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/members?${new URLSearchParams({ ...params, status: tab.id, q: currentQ }).toString()}`}
              className={`pb-3 text-[13.5px] font-semibold transition-colors ${
                active
                  ? "border-b-2 border-arsenal-red text-white"
                  : "border-b-2 border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <form className="mt-5 flex flex-wrap items-center gap-3" method="get">
        <input type="hidden" name="status" value={currentStatus} />
        <div className="relative min-w-[240px] flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={currentQ}
            placeholder="Search name, email, WhatsApp…"
            className="h-10 w-full rounded-xl border border-surface-border bg-white/5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted/40 focus:border-arsenal-gold focus:outline-none"
          />
        </div>

        <select
          name="tier"
          defaultValue={currentTier}
          className="h-10 rounded-xl border border-surface-border bg-white/5 px-3 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
        >
          <option value="" className="bg-arsenal-navy-deep text-muted">All Tiers</option>
          {ACTIVITY_TIERS.map((t) => (
            <option key={t} value={t} className="bg-arsenal-navy-deep text-foreground">
              {t.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          name="state"
          defaultValue={currentState}
          className="h-10 rounded-xl border border-surface-border bg-white/5 px-3 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
        >
          <option value="" className="bg-arsenal-navy-deep text-muted">All States</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s} className="bg-arsenal-navy-deep text-foreground">
              {s}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="h-10 rounded-xl bg-white/10 px-5 text-xs font-bold text-foreground transition-colors hover:bg-white/20"
        >
          Filter
        </button>
      </form>

      {error && <p className="mt-4 text-xs text-arsenal-red-bright">{error.message}</p>}

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Contact</th>
              <th className="px-5 py-3.5">Registered</th>
              <th className="px-5 py-3.5">Tier / Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {members?.map((m) => {
              const dateStr = new Date(m.created_at).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
              });

              return (
                <tr key={m.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-foreground">{m.full_name}</p>
                    <p className="text-xs text-muted">{m.state_of_residence} {m.jersey_size ? `· Size ${m.jersey_size}` : ""}</p>
                  </td>

                  <td className="px-5 py-3.5 text-xs">
                    <p className="font-mono text-foreground/90">{m.whatsapp_number}</p>
                    <p className="text-muted">{m.email}</p>
                  </td>

                  <td className="px-5 py-3.5 text-xs text-muted whitespace-nowrap">
                    {dateStr}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Badge tone={activityTierTone(m.activity_tier as any)}>
                        {m.activity_tier.toUpperCase().replace("_", " ")}
                      </Badge>
                      {m.registration_status !== "approved" && (
                        <Badge tone={registrationStatusTone(m.registration_status as any)}>
                          {m.registration_status.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    {m.registration_status === "pending" && canReview ? (
                      <div className="flex items-center justify-end gap-2">
                        <form action={approveMember} className="flex items-center gap-1">
                          <input type="hidden" name="memberId" value={m.id} />
                          <select
                            name="activityTier"
                            defaultValue="active"
                            className="h-8 rounded-lg border border-surface-border bg-white/5 px-2 text-[11px] text-foreground focus:outline-none"
                          >
                            <option value="active" className="bg-arsenal-navy-deep text-foreground">Active</option>
                            <option value="semi_active" className="bg-arsenal-navy-deep text-foreground">Semi-active</option>
                            <option value="inactive" className="bg-arsenal-navy-deep text-foreground">Inactive</option>
                          </select>
                          <button
                            type="submit"
                            className="flex h-8 items-center rounded-lg bg-whatsapp-green px-3 text-xs font-bold text-arsenal-navy-deep transition-opacity hover:opacity-90"
                          >
                            Approve
                          </button>
                        </form>

                        <form action={rejectMember}>
                          <input type="hidden" name="memberId" value={m.id} />
                          <ConfirmSubmitButton
                            kind="reject-member"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-arsenal-red-bright hover:bg-arsenal-red-bright/10"
                          >
                            Reject
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {members?.length === 0 && (
          <div className="p-10 text-center text-sm text-muted">
            No members found in this status category.
          </div>
        )}
      </div>
    </div>
  );
}
