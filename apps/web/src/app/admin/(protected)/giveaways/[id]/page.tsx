import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
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
  const supabase = createServiceRoleClient();

  const { data: giveaway } = await supabase.from("giveaways").select("*").eq("id", id).single();
  if (!giveaway) notFound();

  const { data: entries } = await supabase
    .from("giveaway_entries")
    .select("id, entered_at, members(full_name, activity_tier, jersey_size)")
    .eq("giveaway_id", id)
    .order("entered_at", { ascending: true });

  const { data: winners } = await supabase
    .from("giveaway_winners")
    .select("id, rank, selection_method, selected_at, disqualified_at, disqualified_reason, prize_note, members(full_name, whatsapp_number)")
    .eq("giveaway_id", id)
    .order("rank", { ascending: true })
    .order("selected_at", { ascending: true });

  const { data: auditLog } = await supabase
    .from("giveaway_audit_log")
    .select("id, event_type, metadata, created_at")
    .eq("giveaway_id", id)
    .order("created_at", { ascending: false });

  const activeWinners = (winners ?? []).filter((w) => !w.disqualified_at);

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">{giveaway.title}</h1>
          {giveaway.description && <p className="mt-1 text-sm text-muted">{giveaway.description}</p>}
          <p className="mt-2 text-xs text-muted">
            {giveaway.type} &middot; eligible: {giveaway.eligibility_tiers.join(", ")}
          </p>
        </div>
        <span className="rounded-full border border-surface-border px-3 py-1 text-xs capitalize text-foreground">
          {giveaway.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {giveaway.status === "draft" && (
          <form action={openGiveaway}>
            <input type="hidden" name="giveawayId" value={id} />
            <button type="submit" className="rounded-full bg-whatsapp-green px-5 py-2.5 text-sm font-medium text-arsenal-navy-deep">
              Open entries
            </button>
          </form>
        )}
        {giveaway.status === "open" && (
          <form action={closeGiveaway}>
            <input type="hidden" name="giveawayId" value={id} />
            <button type="submit" className="rounded-full bg-arsenal-red px-5 py-2.5 text-sm font-medium text-white">
              Close entries
            </button>
          </form>
        )}
        {giveaway.status === "closed" && (
          <form action={drawWinners} className="flex items-center gap-2">
            <input type="hidden" name="giveawayId" value={id} />
            <label className="text-sm text-muted">Winners:</label>
            <input
              type="number"
              name="winnerCount"
              min={1}
              max={entries?.length || 1}
              defaultValue={1}
              className="w-16 rounded-lg border border-surface-border bg-background/60 px-2 py-2 text-sm"
            />
            <button type="submit" className="rounded-full bg-arsenal-gold px-5 py-2.5 text-sm font-medium text-arsenal-navy-deep">
              Draw winner(s)
            </button>
          </form>
        )}
        {giveaway.status === "winner_selected" && (
          <form action={markCompleted}>
            <input type="hidden" name="giveawayId" value={id} />
            <button type="submit" className="rounded-full border border-surface-border px-5 py-2.5 text-sm text-foreground hover:border-arsenal-gold">
              Mark completed
            </button>
          </form>
        )}
      </div>

      {winners && winners.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-foreground">Winners</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-surface-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={w.id} className="border-b border-surface-border/60 last:border-0">
                    <td className="px-4 py-3 text-foreground">#{w.rank}</td>
                    <td className="px-4 py-3 text-muted">
                      {/* @ts-expect-error -- embedded relation typing */}
                      {w.members?.full_name}
                    </td>
                    <td className="px-4 py-3 text-muted">{w.selection_method.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      {w.disqualified_at ? (
                        <span className="text-arsenal-red-bright">Disqualified — {w.disqualified_reason}</span>
                      ) : (
                        <span className="text-whatsapp-green">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!w.disqualified_at && (
                        <form action={disqualifyAndRedraw} className="flex items-center gap-1.5">
                          <input type="hidden" name="winnerId" value={w.id} />
                          <input
                            name="reason"
                            placeholder="Reason"
                            className="w-32 rounded-md border border-surface-border bg-background/60 px-2 py-1 text-xs"
                          />
                          <button type="submit" className="rounded-md border border-surface-border px-2.5 py-1 text-xs text-muted hover:border-arsenal-red-bright hover:text-arsenal-red-bright">
                            Disqualify &amp; redraw
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl text-foreground">
          Entries <span className="text-sm font-normal text-muted">({entries?.length ?? 0})</span>
        </h2>
        <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-surface-border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-surface-border bg-background text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Member</th>
                <th className="px-4 py-2 font-medium">Tier</th>
                <th className="px-4 py-2 font-medium">Jersey</th>
                <th className="px-4 py-2 font-medium">Entered</th>
              </tr>
            </thead>
            <tbody>
              {entries?.map((e) => (
                <tr key={e.id} className="border-b border-surface-border/60 last:border-0">
                  {/* @ts-expect-error -- embedded relation typing */}
                  <td className="px-4 py-2 text-foreground">{e.members?.full_name}</td>
                  {/* @ts-expect-error -- embedded relation typing */}
                  <td className="px-4 py-2 text-muted capitalize">{e.members?.activity_tier}</td>
                  {/* @ts-expect-error -- embedded relation typing */}
                  <td className="px-4 py-2 text-muted">{e.members?.jersey_size ?? "—"}</td>
                  <td className="px-4 py-2 text-muted">{new Date(e.entered_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries?.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">No entries yet.</p>}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-foreground">Audit log</h2>
        <ul className="mt-3 flex flex-col gap-2 text-xs text-muted">
          {auditLog?.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-surface-border px-3 py-2">
              <span className="text-foreground/90 capitalize">{entry.event_type.replace("_", " ")}</span>
              {" — "}
              {new Date(entry.created_at).toLocaleString()}
              {entry.metadata && (
                <pre className="mt-1 whitespace-pre-wrap break-all text-[11px] text-muted/80">
                  {JSON.stringify(entry.metadata)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
