import { createSessionClient } from "@/lib/supabase/server-session";
import { PageHeader } from "@/components/page-header";
import { TrophyIcon } from "@/components/icons";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const supabase = await createSessionClient();

  // RLS (predictions_select_scored_for_leaderboard) reveals SCORED picks
  // community-wide — never picks made before a match is scored.
  const { data: rows } = await supabase
    .from("predictions")
    .select("member_id, points_awarded")
    .not("points_awarded", "is", null);

  const totals = new Map<string, { points: number; matches: number }>();
  for (const row of rows ?? []) {
    const existing = totals.get(row.member_id) ?? { points: 0, matches: 0 };
    existing.points += row.points_awarded ?? 0;
    existing.matches += 1;
    totals.set(row.member_id, existing);
  }

  // Members RLS only allows reading your own row — display names for OTHER
  // members come from a narrow SECURITY DEFINER function instead (see
  // migration leaderboard_member_names), never a widened members SELECT.
  const memberIds = [...totals.keys()];
  let names: { id: string; full_name: string }[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase.rpc("leaderboard_member_names", { member_ids: memberIds });
    names = (data ?? []) as { id: string; full_name: string }[];
  }
  const nameById = new Map(names.map((n) => [n.id, n.full_name]));

  const leaderboard = [...totals.entries()]
    .map(([memberId, v]) => ({ memberId, name: nameById.get(memberId) ?? "Unknown", ...v }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-xl">
      <PageHeader icon={TrophyIcon} title="Leaderboard" subtitle="Points across every scored match this season." spotlight="var(--arsenal-gold)" />

      <div className="mt-8 overflow-hidden rounded-2xl border border-surface-border bg-surface/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Matches</th>
              <th className="px-4 py-3 font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, i) => (
              <tr key={row.memberId} className="border-b border-surface-border/60 last:border-0">
                <td className="px-4 py-3 text-muted">{MEDALS[i] ?? i + 1}</td>
                <td className="px-4 py-3 text-foreground">{row.name}</td>
                <td className="px-4 py-3 text-muted">{row.matches}</td>
                <td className="px-4 py-3 font-medium text-arsenal-gold">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaderboard.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">No scored matches yet — check back after the first result is in.</p>
        )}
      </div>
    </div>
  );
}
