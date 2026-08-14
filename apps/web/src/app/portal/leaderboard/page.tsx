import { redirect } from "next/navigation";
import { createSessionClient, getMemberSession } from "@/lib/supabase/server-session";

export default async function LeaderboardPage() {
  const member = await getMemberSession();
  if (!member) redirect("/login");

  const supabase = await createSessionClient();

  // Fetch scored predictions
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

  const memberIds = [...totals.keys()];
  let names: { id: string; full_name: string }[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase.rpc("leaderboard_member_names", { member_ids: memberIds });
    names = (data ?? []) as { id: string; full_name: string }[];
  }
  const nameById = new Map(names.map((n) => [n.id, n.full_name]));

  const leaderboard = [...totals.entries()]
    .map(([memberId, v]) => ({
      memberId,
      name: memberId === member.memberId ? "You" : nameById.get(memberId) ?? "Anonymous Gunner",
      isMe: memberId === member.memberId,
      ...v,
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="mx-auto max-w-[560px]">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">SEASON LEADERBOARD</h1>
        <p className="mt-1 text-sm text-muted">
          Rankings calculated across every scored prediction this season.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-xl">
        <div className="grid grid-cols-[48px_1fr_80px] border-b border-surface-border px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted">
          <div>#</div>
          <div>MEMBER</div>
          <div className="text-right">POINTS</div>
        </div>

        <div className="divide-y divide-surface-border">
          {leaderboard.map((row, i) => {
            const isFirst = i === 0;

            return (
              <div
                key={row.memberId}
                className={`grid grid-cols-[48px_1fr_80px] items-center px-5 py-3.5 text-sm transition-colors ${
                  row.isMe
                    ? "border-l-4 border-arsenal-red bg-arsenal-red/10 font-bold"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <div
                  className={
                    isFirst
                      ? "font-display text-lg text-arsenal-gold"
                      : row.isMe
                      ? "font-display text-base text-arsenal-red-bright"
                      : "text-muted"
                  }
                >
                  {i + 1}
                </div>

                <div className="flex items-center gap-2 truncate pr-2">
                  <span className={row.isMe ? "text-arsenal-red-bright" : "text-foreground"}>
                    {row.name}
                  </span>
                  {row.isMe && (
                    <span className="rounded bg-arsenal-red px-1.5 py-0.2 text-[10px] font-bold text-white uppercase">
                      You
                    </span>
                  )}
                  {isFirst && (
                    <span className="text-xs">👑</span>
                  )}
                </div>

                <div className="text-right font-display text-lg tracking-wide text-arsenal-gold">
                  {row.points} <span className="text-xs font-normal text-muted">pts</span>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted">
              No scored matches yet — check back after kickoff!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
