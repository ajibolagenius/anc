import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, TrophyIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/ui/confirm-dialog";
import { giveawayStatusTone } from "@/components/ui/status";
import {
  openGiveaway,
  closeGiveaway,
  markCompleted,
  drawWinners,
  disqualifyAndRedraw,
} from "./actions";

export default async function GiveawayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await getAdminSession();
  const canManage = admin?.role === "admin" || admin?.role === "super_admin";
  const canDraw = admin?.role === "super_admin";
  const supabase = createServiceRoleClient();

  const { data: giveaway } = await supabase.from("giveaways").select("*").eq("id", id).single();
  if (!giveaway) notFound();

  const { data: entries } = await supabase
    .from("giveaway_entries")
    .select("id, entered_at, members(full_name, activity_tier, jersey_size, state_of_residence)")
    .eq("giveaway_id", id)
    .order("entered_at", { ascending: true });

  const { data: winners } = await supabase
    .from("giveaway_winners")
    .select(
      "id, rank, selection_method, selected_at, disqualified_at, disqualified_reason, prize_note, replaces_winner_id, members(full_name, whatsapp_number, jersey_size, state_of_residence)",
    )
    .eq("giveaway_id", id)
    .order("rank", { ascending: true })
    .order("selected_at", { ascending: true });

  const { data: auditLog } = await supabase
    .from("giveaway_audit_log")
    .select("id, event_type, metadata, created_at")
    .eq("giveaway_id", id)
    .order("created_at", { ascending: false });

  const entryCount = entries?.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/giveaways"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All Giveaways
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">
            {giveaway.title.toUpperCase()}
          </h1>
          <p className="mt-1 text-xs text-muted">
            <span className="capitalize">{giveaway.type}</span> · Eligible:{" "}
            {giveaway.eligibility_tiers.map((t: string) => t.replace("_", " ")).join(", ")}
          </p>
          {giveaway.description && <p className="mt-2 text-sm text-foreground/80">{giveaway.description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Badge tone={giveawayStatusTone(giveaway.status as any)}>
            {giveaway.status.toUpperCase().replace("_", " ")} · {entryCount} {entryCount === 1 ? "entry" : "entries"}
          </Badge>
        </div>
      </div>

      {/* Controls & Lifecycle */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {giveaway.status === "draft" && canManage && (
          <form action={openGiveaway}>
            <input type="hidden" name="giveawayId" value={id} />
            <button
              type="submit"
              className="h-10 rounded-full bg-whatsapp-green px-5 text-xs font-bold text-arsenal-navy-deep transition-opacity hover:opacity-90"
            >
              Open Entries Now
            </button>
          </form>
        )}

        {giveaway.status === "open" && canManage && (
          <form action={closeGiveaway}>
            <input type="hidden" name="giveawayId" value={id} />
            <ConfirmSubmitButton
              kind="close-giveaway"
              variant="danger"
              size="sm"
              className="h-10 rounded-full px-5 text-xs"
            >
              Close Entries
            </ConfirmSubmitButton>
          </form>
        )}

        {giveaway.status === "winner_selected" && canManage && (
          <form action={markCompleted}>
            <input type="hidden" name="giveawayId" value={id} />
            <button
              type="submit"
              className="h-10 rounded-full border border-surface-border bg-white/5 px-5 text-xs font-bold text-foreground transition-colors hover:border-arsenal-gold"
            >
              Mark Completed
            </button>
          </form>
        )}
      </div>

      {/* Draw Panel */}
      {giveaway.status === "closed" && (
        <div className="mt-8 rounded-2xl border border-arsenal-gold bg-surface p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-arsenal-gold/20 text-arsenal-gold">
            <TrophyIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-2xl tracking-wide text-foreground">CONDUCT WINNER DRAW</h2>
          <p className="mt-1 text-xs text-muted">
            Provably-fair random draw via crypto.randomInt · Results are committed immediately to the audit log.
          </p>

          {canDraw ? (
            <form action={drawWinners} className="mt-6 flex flex-col items-center gap-4">
              <input type="hidden" name="giveawayId" value={id} />
              <div className="flex items-center gap-3">
                <label htmlFor="winnerCount" className="text-xs font-bold uppercase text-muted">
                  Number of winners:
                </label>
                <input
                  id="winnerCount"
                  type="number"
                  name="winnerCount"
                  min={1}
                  max={Math.max(1, entryCount)}
                  defaultValue={1}
                  className="h-10 w-20 rounded-xl border border-surface-border bg-white/5 px-3 text-center text-sm font-bold text-foreground focus:border-arsenal-gold focus:outline-none"
                />
              </div>

              <ConfirmSubmitButton
                kind="draw-winners"
                variant="primary"
                size="md"
                className="mt-2 h-12 rounded-xl px-9 font-display text-base tracking-widest uppercase"
              >
                RUN DRAW
              </ConfirmSubmitButton>
            </form>
          ) : (
            <p className="mt-4 text-xs font-medium text-arsenal-gold">
              Drawing winners is restricted to Super Admins.
            </p>
          )}
        </div>
      )}

      {/* Winners List */}
      {winners && winners.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-arsenal-gold" />
            <h2 className="font-display text-xl tracking-wide text-foreground">WINNERS</h2>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-xl divide-y divide-surface-border">
            {winners.map((w) => {
              const isDisqualified = !!w.disqualified_at;
              const memberData = Array.isArray(w.members) ? w.members[0] : w.members;

              return (
                <div key={w.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-arsenal-gold">#{w.rank}</span>
                    <div>
                      <p className={isDisqualified ? "line-through text-muted" : "font-bold text-foreground"}>
                        {memberData?.full_name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted">
                        {memberData?.state_of_residence} {memberData?.jersey_size ? `· Size ${memberData.jersey_size}` : ""}
                        {isDisqualified && w.disqualified_reason && (
                          <span className="ml-2 text-arsenal-red-bright font-medium">({w.disqualified_reason})</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isDisqualified ? (
                      <Badge tone="gold">DISQUALIFIED</Badge>
                    ) : (
                      <>
                        <Badge tone="green">WINNER</Badge>
                        {canDraw && giveaway.status !== "completed" && (
                          <form action={disqualifyAndRedraw} className="flex items-center gap-2">
                            <input type="hidden" name="winnerId" value={w.id} />
                            <input
                              name="reason"
                              required
                              placeholder="Reason for redraw…"
                              className="h-8 w-36 rounded-lg border border-surface-border bg-white/5 px-2.5 text-xs text-foreground focus:outline-none"
                            />
                            <ConfirmSubmitButton
                              kind="disqualify"
                              variant="danger"
                              size="sm"
                              className="h-8 text-xs px-3"
                            >
                              Disqualify
                            </ConfirmSubmitButton>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-foreground">
          ENTRIES <span className="text-sm font-normal text-muted">({entryCount})</span>
        </h2>

        <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-surface-border bg-surface text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Tier</th>
                <th className="px-5 py-3">Jersey</th>
                <th className="px-5 py-3 text-right">Entered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {entries?.map((e) => {
                const memberData = Array.isArray(e.members) ? e.members[0] : e.members;
                return (
                  <tr key={e.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-medium text-foreground">{memberData?.full_name ?? "Member"}</td>
                    <td className="px-5 py-3 text-xs capitalize text-muted">{memberData?.activity_tier ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-muted">{memberData?.jersey_size ?? "—"}</td>
                    <td className="px-5 py-3 text-right text-xs text-muted">
                      {new Date(e.entered_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {entries?.length === 0 && (
            <p className="p-8 text-center text-xs text-muted">No entries registered yet.</p>
          )}
        </div>
      </div>

      {/* Audit Log */}
      <div className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-foreground">AUDIT LOG</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-border bg-surface divide-y divide-surface-border shadow-xl">
          {auditLog?.map((entry) => (
            <div key={entry.id} className="p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-arsenal-gold">
                  {entry.event_type.replace("_", " ")}
                </span>
                <span className="text-muted">{new Date(entry.created_at).toLocaleString()}</span>
              </div>
              {entry.metadata && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-black/30 p-2.5 text-[11px] text-muted/90 font-mono">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))}

          {auditLog?.length === 0 && (
            <p className="p-6 text-center text-xs text-muted">No audit events recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
