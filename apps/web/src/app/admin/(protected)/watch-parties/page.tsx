import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { NIGERIAN_STATES } from "@anc/shared";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/ui/confirm-dialog";
import { watchPartyStatusTone } from "@/components/ui/status";
import { createWatchParty, approveWatchParty, rejectWatchParty } from "./actions";

export default async function AdminWatchPartiesPage() {
  const admin = await getAdminSession();
  const canCreate = admin?.role === "admin" || admin?.role === "super_admin";
  const supabase = createServiceRoleClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent, kickoff_at")
    .order("kickoff_at", { ascending: false });

  const { data: listings, error } = await supabase
    .from("watch_parties")
    .select(
      "id, match_id, state, city, venue_name, address, map_link, contact_name, contact_whatsapp, is_recurring, submitted_by, submitted_by_member_id, status, created_at",
    )
    .order("created_at", { ascending: false });

  const submitterIds = [
    ...new Set((listings ?? []).map((w) => w.submitted_by_member_id).filter((id) => id !== null)),
  ];
  const { data: submitters } = submitterIds.length
    ? await supabase.from("members").select("id, full_name").in("id", submitterIds)
    : { data: [] };
  const nameByMemberId = new Map((submitters ?? []).map((m) => [m.id, m.full_name]));
  const opponentByMatchId = new Map((matches ?? []).map((m) => [m.id, m.opponent]));

  const pending = (listings ?? []).filter((w) => w.status === "pending");
  const approved = (listings ?? []).filter((w) => w.status !== "pending");

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">WATCH PARTIES</h1>
        <p className="mt-1 text-sm text-muted">
          Review member-submitted screening venues and post official ANC matchday viewing centres.
        </p>
      </div>

      {/* New Listing Form */}
      {canCreate && (
        <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-6 sm:p-7 shadow-xl max-w-2xl">
          <h2 className="font-display text-xl tracking-wide text-foreground">POST OFFICIAL VENUE</h2>
          <p className="mt-0.5 text-xs text-muted">Auto-approved listing published directly to members.</p>

          <form action={createWatchParty} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="adm-venue" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Venue Name
              </label>
              <input
                id="adm-venue"
                name="venueName"
                required
                placeholder="e.g. Lagos Gooner Lounge"
                className="h-10 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="adm-state" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                State
              </label>
              <select
                id="adm-state"
                name="state"
                required
                defaultValue=""
                className="h-10 w-full rounded-xl border border-surface-border bg-white/5 px-3 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
              >
                <option value="" disabled className="bg-arsenal-navy-deep text-muted">Select State</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-arsenal-navy-deep text-foreground">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="adm-city" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                City / Area
              </label>
              <input
                id="adm-city"
                name="city"
                required
                placeholder="e.g. Victoria Island"
                className="h-10 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="adm-address" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Address (optional)
              </label>
              <input
                id="adm-address"
                name="address"
                placeholder="e.g. 10 Adeola Odeku St, VI"
                className="h-10 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                <input type="checkbox" name="isRecurring" className="h-3.5 w-3.5 rounded border-surface-border bg-white/5" />
                <span>Recurring weekly venue (hosts all matches)</span>
              </label>
            </div>

            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                className="flex h-10 items-center justify-center rounded-xl bg-arsenal-red px-6 text-xs font-bold text-white transition-colors hover:bg-arsenal-red-bright"
              >
                Publish Venue
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="mt-6 text-xs text-arsenal-red-bright">{error.message}</p>}

      {/* Pending Approval Section */}
      {pending.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-arsenal-gold" />
            <h2 className="font-display text-xl tracking-wide text-arsenal-gold">PENDING APPROVAL ({pending.length})</h2>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {pending.map((w) => (
              <Card key={w.id} highlight className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-foreground">{w.venue_name}</h3>
                    <p className="text-xs text-muted">
                      {w.city}, {w.state} {w.address ? `· ${w.address}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-arsenal-gold font-medium">
                      Submitted by {nameByMemberId.get(w.submitted_by_member_id ?? "") ?? "a member"}
                      {w.match_id && opponentByMatchId.has(w.match_id) ? ` · for vs ${opponentByMatchId.get(w.match_id)}` : ""}
                    </p>
                    {w.contact_name && (
                      <p className="mt-1 text-xs text-muted">
                        Contact: {w.contact_name} {w.contact_whatsapp ? `(${w.contact_whatsapp})` : ""}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={approveWatchParty}>
                      <input type="hidden" name="id" value={w.id} />
                      <button
                        type="submit"
                        className="flex h-8 items-center rounded-lg bg-whatsapp-green px-3 text-xs font-bold text-arsenal-navy-deep transition-opacity hover:opacity-90"
                      >
                        Approve
                      </button>
                    </form>

                    <form action={rejectWatchParty}>
                      <input type="hidden" name="id" value={w.id} />
                      <ConfirmSubmitButton
                        kind="reject-watchparty"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-arsenal-red-bright hover:bg-arsenal-red-bright/10"
                      >
                        Reject
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Listings Table */}
      <div className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-foreground">ALL LISTINGS ({approved.length})</h2>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5">Venue</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {approved.map((w) => (
                <tr key={w.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-foreground">{w.venue_name}</p>
                    {w.is_recurring && <span className="text-[10px] text-arsenal-gold uppercase">Weekly</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted">
                    {w.city}, {w.state}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted capitalize">
                    {w.submitted_by === "admin"
                      ? "Official Admin"
                      : nameByMemberId.get(w.submitted_by_member_id ?? "") ?? "Member"}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={watchPartyStatusTone(w.status as any)}>
                      {w.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-muted">
                    {new Date(w.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {approved.length === 0 && (
            <p className="p-8 text-center text-xs text-muted">No approved listings yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
