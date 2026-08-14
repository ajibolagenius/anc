import { createSessionClient } from "@/lib/supabase/server-session";
import { inputClassName } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { CalendarIcon } from "@/components/icons";
import { submitPrediction } from "./actions";

export default async function MemberPredictionsPage() {
  const supabase = await createSessionClient();

  // RLS (matches_select_all) already scopes this to approved members.
  const { data: matches } = await supabase.from("matches").select("*").order("kickoff_at", { ascending: true });

  // Explicitly filtered to my own member_id — RLS alone isn't enough to mean
  // "mine" here, since predictions_select_scored_for_leaderboard (a separate
  // permissive policy) also grants read access to OTHER members' scored
  // predictions on the same table. Policies OR together: an unfiltered
  // select("*") returns the union of everything any policy allows, not just
  // "my own" rows, which previously caused another member's prediction to
  // silently overwrite mine when both shared a match_id key.
  const { data: userData } = await supabase.auth.getUser();
  const { data: me } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", userData.user!.id)
    .single();
  const { data: myPredictions } = await supabase.from("predictions").select("*").eq("member_id", me?.id ?? "");
  const byMatchId = new Map((myPredictions ?? []).map((p) => [p.match_id, p]));

  const now = new Date();
  const upcoming = (matches ?? []).filter((m) => m.status === "upcoming" && new Date(m.kickoff_at) > now);
  const past = (matches ?? []).filter((m) => m.status === "completed" || new Date(m.kickoff_at) <= now);

  return (
    <div className="max-w-2xl">
      <PageHeader icon={CalendarIcon} title="Predictions" subtitle="Call the scoreline and first scorer — banter fuel, not fantasy football." />

      <h2 className="mt-10 font-display text-xl text-foreground">Upcoming</h2>
      <div className="mt-3 flex flex-col gap-4">
        {upcoming.map((match) => {
          const mine = byMatchId.get(match.id);
          return (
            <div key={match.id} className="rounded-2xl border border-surface-border bg-surface/40 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground">vs {match.opponent}</h3>
                <span className="text-xs text-muted">{new Date(match.kickoff_at).toLocaleString()}</span>
              </div>
              {mine ? (
                <p className="mt-3 text-sm text-whatsapp-green">
                  You predicted {mine.predicted_home_score}–{mine.predicted_away_score}
                  {mine.predicted_first_scorer ? ` · ${mine.predicted_first_scorer} to score first` : ""}
                </p>
              ) : (
                <form action={submitPrediction} className="mt-3 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="matchId" value={match.id} />
                  <input type="number" name="predictedHomeScore" min={0} required placeholder="ARS" className={`${inputClassName} w-20`} />
                  <span className="text-muted">–</span>
                  <input type="number" name="predictedAwayScore" min={0} required placeholder={match.opponent.slice(0, 3).toUpperCase()} className={`${inputClassName} w-20`} />
                  <input name="predictedFirstScorer" placeholder="First scorer (optional)" className={`${inputClassName} w-48`} />
                  <button type="submit" className="rounded-full bg-arsenal-red px-4 py-2 text-sm font-medium text-white hover:scale-[1.02]">
                    Predict
                  </button>
                </form>
              )}
            </div>
          );
        })}
        {upcoming.length === 0 && <p className="text-sm text-muted">No upcoming fixtures yet.</p>}
      </div>

      <h2 className="mt-10 font-display text-xl text-foreground">Past results</h2>
      <div className="mt-3 flex flex-col gap-3">
        {past.map((match) => {
          const mine = byMatchId.get(match.id);
          return (
            <div key={match.id} className="rounded-2xl border border-surface-border bg-surface/30 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground">vs {match.opponent}</span>
                <span className="text-muted">
                  {match.status === "completed"
                    ? `${match.actual_home_score}–${match.actual_away_score}`
                    : "Awaiting result"}
                </span>
              </div>
              {mine && (
                <p className="mt-1 text-muted">
                  You predicted {mine.predicted_home_score}–{mine.predicted_away_score}
                  {mine.points_awarded !== null ? ` · ${mine.points_awarded} pt(s)` : ""}
                </p>
              )}
            </div>
          );
        })}
        {past.length === 0 && <p className="text-sm text-muted">No past fixtures yet.</p>}
      </div>
    </div>
  );
}
