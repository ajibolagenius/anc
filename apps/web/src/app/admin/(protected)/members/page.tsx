import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ACTIVITY_TIERS, NIGERIAN_STATES } from "@anc/shared";
import { approveMember, rejectMember } from "./actions";
import { inputClassName } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { UsersIcon } from "@/components/icons";

type SearchParams = {
  status?: string;
  tier?: string;
  state?: string;
  q?: string;
};

const STATUS_TABS = ["pending", "approved", "rejected", "suspended", "all"] as const;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status ?? "pending";
  const tier = params.tier ?? "";
  const state = params.state ?? "";
  const q = params.q ?? "";

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("members")
    .select(
      "id, full_name, whatsapp_number, email, state_of_residence, jersey_size, activity_tier, registration_status, created_at",
    )
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("registration_status", status);
  if (tier) query = query.eq("activity_tier", tier);
  if (state) query = query.eq("state_of_residence", state);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,whatsapp_number.ilike.%${q}%`);

  const { data: members, error } = await query;

  const exportQuery = new URLSearchParams({ status, tier, state, q }).toString();

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader icon={UsersIcon} title="Members" />
        <a
          href={`/admin/members/export?${exportQuery}`}
          className="rounded-full border border-surface-border px-4 py-2 text-xs text-foreground transition-colors hover:border-arsenal-gold"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6 flex gap-1 border-b border-surface-border text-sm">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={`/admin/members?${new URLSearchParams({ ...params, status: tab, q: q || "" }).toString()}`}
            className={`border-b-2 px-3 py-2 capitalize transition-colors ${
              status === tab
                ? "border-arsenal-red text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      <form className="mt-4 flex flex-wrap gap-3" method="get">
        <input type="hidden" name="status" value={status} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, WhatsApp…"
          className={`${inputClassName} max-w-xs`}
        />
        <select name="tier" defaultValue={tier} className={inputClassName}>
          <option value="">All tiers</option>
          {ACTIVITY_TIERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select name="state" defaultValue={state} className={inputClassName}>
          <option value="">All states</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-surface-border px-4 py-2.5 text-sm text-foreground hover:border-arsenal-gold"
        >
          Filter
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-arsenal-red-bright">{error.message}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-surface-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 font-medium">Jersey</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <tr key={member.id} className="border-b border-surface-border/60 last:border-0">
                <td className="px-4 py-3 text-foreground">{member.full_name}</td>
                <td className="px-4 py-3 text-muted">
                  <div>{member.whatsapp_number}</div>
                  <div className="text-xs">{member.email}</div>
                </td>
                <td className="px-4 py-3 text-muted">{member.state_of_residence}</td>
                <td className="px-4 py-3 text-muted">{member.jersey_size ?? "—"}</td>
                <td className="px-4 py-3 text-muted capitalize">{member.activity_tier}</td>
                <td className="px-4 py-3 text-muted capitalize">{member.registration_status}</td>
                <td className="px-4 py-3">
                  {member.registration_status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <form action={approveMember} className="flex items-center gap-1.5">
                        <input type="hidden" name="memberId" value={member.id} />
                        <select
                          name="activityTier"
                          defaultValue="active"
                          className="rounded-md border border-surface-border bg-background/60 px-1.5 py-1 text-xs"
                        >
                          {ACTIVITY_TIERS.filter((t) => t !== "pending").map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-md bg-whatsapp-green px-2.5 py-1 text-xs font-medium text-arsenal-navy-deep"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={rejectMember}>
                        <input type="hidden" name="memberId" value={member.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-surface-border px-2.5 py-1 text-xs text-muted hover:border-arsenal-red-bright hover:text-arsenal-red-bright"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members?.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">No members match these filters.</p>
        )}
      </div>
    </div>
  );
}
