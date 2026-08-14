import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { inputClassName } from "@/components/form-field";
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

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground">Arsenal vs {match.opponent}</h1>
      <p className="mt-1 text-sm text-muted">
        {match.competition ?? "Friendly"} &middot; {new Date(match.kickoff_at).toLocaleString()} &middot;{" "}
        <span className="capitalize">{match.status}</span>
      </p>

      <form action={enterResult} className="mt-6 flex flex-col gap-4 rounded-2xl border border-surface-border p-5">
        <h2 className="text-sm font-medium text-foreground/90">
          {match.status === "completed" ? "Update result" : "Enter result"}
        </h2>
        <input type="hidden" name="matchId" value={id} />
        <div className="flex items-center gap-3">
          <input
            type="number"
            name="actualHomeScore"
            required
            min={0}
            defaultValue={match.actual_home_score ?? ""}
            placeholder="Arsenal"
            className={`${inputClassName} w-24`}
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            name="actualAwayScore"
            required
            min={0}
            defaultValue={match.actual_away_score ?? ""}
            placeholder={match.opponent}
            className={`${inputClassName} w-24`}
          />
        </div>
        <input
          name="actualFirstScorer"
          defaultValue={match.actual_first_scorer ?? ""}
          placeholder="First goalscorer (optional)"
          className={inputClassName}
        />
        <button
          type="submit"
          className="self-start rounded-full bg-arsenal-gold px-6 py-2.5 text-sm font-medium text-arsenal-navy-deep hover:scale-[1.02]"
        >
          Save result &amp; score predictions
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-display text-xl text-foreground">
          Predictions <span className="text-sm font-normal text-muted">({predictions?.length ?? 0})</span>
        </h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-surface-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Predicted</th>
                <th className="px-4 py-3 font-medium">Scorer guess</th>
                <th className="px-4 py-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {predictions?.map((p) => (
                <tr key={p.id} className="border-b border-surface-border/60 last:border-0">
                  {/* @ts-expect-error -- embedded relation typing */}
                  <td className="px-4 py-3 text-foreground">{p.members?.full_name}</td>
                  <td className="px-4 py-3 text-muted">
                    {p.predicted_home_score}–{p.predicted_away_score}
                  </td>
                  <td className="px-4 py-3 text-muted">{p.predicted_first_scorer ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">{p.points_awarded ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {predictions?.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted">No predictions submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
