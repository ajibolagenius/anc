import { redirect } from "next/navigation";
import { createSessionClient, getMemberSession } from "@/lib/supabase/server-session";
import { submitPrediction } from "./actions";

export default async function MemberPredictionsPage() {
  const member = await getMemberSession();
  if (!member) redirect("/login");

  const supabase = await createSessionClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true });

  const { data: myPredictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("member_id", member.memberId);
  const byMatchId = new Map((myPredictions ?? []).map((p) => [p.match_id, p]));

  const now = new Date();
  const upcoming = (matches ?? []).filter(
    (m) => m.status === "upcoming" && new Date(m.kickoff_at) > now,
  );
  const past = (matches ?? []).filter(
    (m) => m.status === "completed" || new Date(m.kickoff_at) <= now,
  );

  return (
    <div className="mx-auto max-w-xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">PREDICTIONS</h1>
        <p className="mt-1 text-sm text-muted">
          Call the scoreline and first scorer — climb the season leaderboard for bragging rights.
        </p>
      </div>

      {/* Upcoming Fixtures */}
      <div className="mt-8 flex flex-col gap-6">
        {upcoming.map((match) => {
          const mine = byMatchId.get(match.id);
          const oppCode = match.opponent.slice(0, 3).toUpperCase();
          const kickoff = new Date(match.kickoff_at);
          const hoursLeft = Math.max(0, Math.round((kickoff.getTime() - Date.now()) / (1000 * 60 * 60)));

          return (
            <div key={match.id} className="rounded-2xl border border-surface-border bg-surface p-6 shadow-lg">
              {/* Fixture Header */}
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {match.competition || "Premier League"}
                </span>
                <span className="rounded-full bg-arsenal-gold/15 px-2.5 py-0.5 text-xs font-bold text-arsenal-gold">
                  {hoursLeft > 24
                    ? kickoff.toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" })
                    : `Closes in ${hoursLeft}h`}
                </span>
              </div>

              {/* Team Badges Row */}
              <div className="my-6 flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-arsenal-red bg-arsenal-red/20 font-display text-lg text-white">
                    ARS
                  </div>
                  <span className="mt-1 text-xs font-bold text-foreground">Arsenal</span>
                </div>

                <div className="font-display text-sm tracking-widest text-arsenal-gold">VS</div>

                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 font-display text-lg text-white">
                    {oppCode}
                  </div>
                  <span className="mt-1 text-xs font-bold text-foreground">{match.opponent}</span>
                </div>
              </div>

              {mine ? (
                <div className="rounded-xl border border-whatsapp-green/40 bg-whatsapp-green/10 p-4 text-center">
                  <p className="font-display text-2xl tracking-widest text-white">
                    {mine.predicted_home_score} – {mine.predicted_away_score}
                  </p>
                  <p className="mt-1 text-xs text-whatsapp-green font-medium">
                    Locked in {mine.predicted_first_scorer ? `· Scorer: ${mine.predicted_first_scorer}` : ""}
                  </p>
                </div>
              ) : (
                <form action={submitPrediction} className="flex flex-col gap-4">
                  <input type="hidden" name="matchId" value={match.id} />

                  {/* Score inputs */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <label htmlFor={`home-${match.id}`} className="mb-1 block text-[10px] uppercase font-bold text-muted">
                        ARS
                      </label>
                      <input
                        id={`home-${match.id}`}
                        type="number"
                        name="predictedHomeScore"
                        min={0}
                        max={20}
                        required
                        defaultValue=""
                        className="h-[52px] w-[64px] rounded-xl border border-surface-border bg-white/5 text-center font-display text-2xl text-white focus:border-arsenal-gold focus:outline-none"
                      />
                    </div>

                    <span className="font-display text-2xl text-muted self-end pb-3">–</span>

                    <div className="text-center">
                      <label htmlFor={`away-${match.id}`} className="mb-1 block text-[10px] uppercase font-bold text-muted">
                        {oppCode}
                      </label>
                      <input
                        id={`away-${match.id}`}
                        type="number"
                        name="predictedAwayScore"
                        min={0}
                        max={20}
                        required
                        defaultValue=""
                        className="h-[52px] w-[64px] rounded-xl border border-surface-border bg-white/5 text-center font-display text-2xl text-white focus:border-arsenal-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* First Goalscorer */}
                  <div>
                    <input
                      name="predictedFirstScorer"
                      placeholder="First goalscorer (e.g. Bukayo Saka) · optional"
                      className="h-[44px] w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground placeholder:text-muted/40 focus:border-arsenal-gold focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex h-[46px] w-full items-center justify-center rounded-[10px] bg-arsenal-red text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
                  >
                    Lock In Prediction
                  </button>
                  <p className="text-center text-[11px] text-muted">Predictions lock at kickoff.</p>
                </form>
              )}
            </div>
          );
        })}

        {upcoming.length === 0 && (
          <div className="rounded-2xl border border-dashed border-surface-border p-8 text-center text-sm text-muted">
            No upcoming fixtures posted for prediction yet.
          </div>
        )}
      </div>

      {/* Past Predictions */}
      <div className="mt-12">
        <h2 className="font-display text-xl tracking-wide text-foreground">PAST PREDICTIONS</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-border bg-surface divide-y divide-surface-border">
          {past.map((match) => {
            const mine = byMatchId.get(match.id);
            const isCompleted = match.status === "completed";

            return (
              <div key={match.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">vs {match.opponent}</p>
                  <p className="text-xs text-muted">
                    {isCompleted
                      ? `Result: ${match.actual_home_score}–${match.actual_away_score}`
                      : "Awaiting final score"}
                    {mine ? ` · You predicted ${mine.predicted_home_score}–${mine.predicted_away_score}` : " · No prediction"}
                  </p>
                </div>

                <div>
                  {mine && mine.points_awarded !== null && (
                    <span className="font-bold text-whatsapp-green">
                      +{mine.points_awarded} {mine.points_awarded === 1 ? "pt" : "pts"}
                    </span>
                  )}
                  {mine && mine.points_awarded === null && isCompleted && (
                    <span className="text-xs text-muted">0 pts</span>
                  )}
                  {!isCompleted && mine && (
                    <span className="text-xs text-arsenal-gold">Pending</span>
                  )}
                </div>
              </div>
            );
          })}

          {past.length === 0 && (
            <div className="p-6 text-center text-xs text-muted">No past match predictions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
