import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { matchStatusTone } from "@/components/ui/status";
import { enterResult } from "./actions";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: match } = await supabase.from("matches").select("*").eq("id", id).single();
  if (!match) notFound();

  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, predicted_home_score, predicted_away_score, predicted_first_scorer, points_awarded, members(full_name)")
    .eq("match_id", id)
    .order("points_awarded", { ascending: false, nullsFirst: false });

  const oppCode = match.opponent.slice(0, 3).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/matches"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All Matches
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">
            ARSENAL VS {match.opponent.toUpperCase()}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {match.competition ?? "Premier League"} · Kickoff:{" "}
            {new Date(match.kickoff_at).toLocaleDateString("en-NG", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <Badge tone={matchStatusTone(match.status as any)}>
          {match.status.toUpperCase()}
        </Badge>
      </div>

      {/* Enter Result Form */}
      <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-6 sm:p-7 shadow-xl max-w-lg">
        <h2 className="font-display text-xl tracking-wide text-foreground">
          {match.status === "completed" ? "UPDATE RESULT" : "RECORD OFFICIAL RESULT"}
        </h2>
        <p className="mt-1 text-xs text-muted">
          Saving the final scoreline will automatically calculate and award prediction points to all entrants.
        </p>

        <form action={enterResult} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="matchId" value={id} />

          <div className="flex items-center gap-4">
            <div>
              <label htmlFor="homeScore" className="mb-1 block text-[10px] uppercase font-bold text-muted">
                ARSENAL
              </label>
              <input
                id="homeScore"
                type="number"
                name="actualHomeScore"
                required
                min={0}
                defaultValue={match.actual_home_score ?? ""}
                placeholder="ARS"
                className="h-[52px] w-[80px] rounded-xl border border-surface-border bg-white/5 text-center font-display text-2xl text-white focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <span className="font-display text-2xl text-muted self-end pb-3">–</span>

            <div>
              <label htmlFor="awayScore" className="mb-1 block text-[10px] uppercase font-bold text-muted">
                {oppCode}
              </label>
              <input
                id="awayScore"
                type="number"
                name="actualAwayScore"
                required
                min={0}
                defaultValue={match.actual_away_score ?? ""}
                placeholder={oppCode}
                className="h-[52px] w-[80px] rounded-xl border border-surface-border bg-white/5 text-center font-display text-2xl text-white focus:border-arsenal-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="firstScorer" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
              First Goalscorer (optional)
            </label>
            <input
              id="firstScorer"
              name="actualFirstScorer"
              defaultValue={match.actual_first_scorer ?? ""}
              placeholder="e.g. Bukayo Saka"
              className="h-10 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
            />
          </div>

          <div className="mt-2">
            <button
              type="submit"
              className="flex h-11 items-center justify-center rounded-xl bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
            >
              Save Result &amp; Score
            </button>
          </div>
        </form>
      </div>

      {/* Predictions list */}
      <div className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-foreground">
          PREDICTIONS <span className="text-sm font-normal text-muted">({predictions?.length ?? 0})</span>
        </h2>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Predicted</th>
                <th className="px-5 py-3">Scorer Pick</th>
                <th className="px-5 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {predictions?.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                  {/* @ts-expect-error -- relation typing */}
                  <td className="px-5 py-3 font-semibold text-foreground">{p.members?.full_name}</td>
                  <td className="px-5 py-3 text-sm font-mono text-muted">
                    {p.predicted_home_score} – {p.predicted_away_score}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted">{p.predicted_first_scorer || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {p.points_awarded !== null ? (
                      <span className="font-bold text-whatsapp-green">+{p.points_awarded} pts</span>
                    ) : (
                      <span className="text-xs text-muted">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {predictions?.length === 0 && (
            <p className="p-8 text-center text-xs text-muted">No member predictions entered for this fixture.</p>
          )}
        </div>
      </div>
    </div>
  );
}
