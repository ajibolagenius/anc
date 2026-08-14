import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon, TrophyIcon, MapPinIcon } from "@phosphor-icons/react/ssr";
import { createSessionClient, getMemberSession } from "@/lib/supabase/server-session";
import { Card } from "@/components/ui/card";

export default async function PortalHomePage() {
  const member = await getMemberSession();
  if (!member) redirect("/login");

  const supabase = await createSessionClient();
  const firstName = member.fullName.split(" ")[0] ?? member.fullName;

  // 1. Next fixture
  const now = new Date();
  const { data: nextMatches } = await supabase
    .from("matches")
    .select("id, opponent, kickoff_at, status")
    .eq("status", "upcoming")
    .gt("kickoff_at", now.toISOString())
    .order("kickoff_at", { ascending: true })
    .limit(1);
  const nextMatch = nextMatches?.[0] ?? null;

  // 2. Open giveaway
  const { data: openGiveaways } = await supabase
    .from("giveaways")
    .select("id, title, status, entry_closes_at, eligibility_tiers")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1);
  const openGiveaway = openGiveaways?.[0] ?? null;

  // 3. Leaderboard mini-list (top 5 + current member)
  const { data: predictionRows } = await supabase
    .from("predictions")
    .select("member_id, points_awarded")
    .not("points_awarded", "is", null);

  const totals = new Map<string, { points: number; matches: number }>();
  for (const row of predictionRows ?? []) {
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

  const sortedLeaderboard = [...totals.entries()]
    .map(([memberId, v]) => ({
      memberId,
      name: memberId === member.memberId ? "You" : nameById.get(memberId) ?? "Unknown",
      isMe: memberId === member.memberId,
      ...v,
    }))
    .sort((a, b) => b.points - a.points);

  const top5 = sortedLeaderboard.slice(0, 5);

  // 4. Watch parties in member's state
  const { data: localParties } = await supabase
    .from("watch_parties")
    .select("id, venue_name, city, state, is_recurring")
    .eq("status", "approved")
    .eq("state", member.stateOfResidence)
    .limit(4);

  // Helper formatting for countdown
  let giveawayCountdown = "Open now";
  if (openGiveaway?.entry_closes_at) {
    const closesAt = new Date(openGiveaway.entry_closes_at);
    const diffDays = Math.ceil((closesAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    giveawayCountdown = diffDays > 0 ? `Closes in ${diffDays} day${diffDays > 1 ? "s" : ""}` : "Closes soon";
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">
          WELCOME BACK, {firstName.toUpperCase()}
        </h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s happening in ANC.</p>
      </div>

      {/* 3 Summary Cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {/* Card 1: Your Fan Pass */}
        <Link href="/portal/fan-pass" className="group block">
          <Card className="h-full p-6 transition-all hover:border-arsenal-gold/50 group-hover:bg-white/[0.06]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">YOUR FAN PASS</p>
            <p className="mt-3 font-display text-2xl tracking-wider text-arsenal-gold">
              {member.ancNumber ?? "PENDING"}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-foreground/80 group-hover:text-foreground">
              <span>View card & share</span>
              <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>

        {/* Card 2: Next Fixture */}
        <Link href="/portal/predictions" className="group block">
          <Card className="h-full p-6 transition-all hover:border-arsenal-gold/50 group-hover:bg-white/[0.06]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">NEXT FIXTURE</p>
            <p className="mt-3 font-display text-2xl tracking-wide text-foreground">
              {nextMatch ? `ARSENAL VS ${nextMatch.opponent.toUpperCase()}` : "NO FIXTURE POSTED"}
            </p>
            <p className="mt-4 text-xs text-muted">
              {nextMatch
                ? `Predict before ${new Date(nextMatch.kickoff_at).toLocaleDateString("en-NG", {
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Check back later"}
            </p>
          </Card>
        </Link>

        {/* Card 3: Open Giveaway (Highlighted) */}
        <Link href="/portal/giveaways" className="group block">
          <Card
            highlight
            className="h-full p-6 transition-all hover:border-arsenal-gold group-hover:bg-white/[0.06]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-arsenal-gold">OPEN GIVEAWAY</p>
            <p className="mt-3 font-display text-2xl tracking-wide text-foreground">
              {openGiveaway ? openGiveaway.title.toUpperCase() : "NO OPEN DRAWS"}
            </p>
            <p className="mt-4 text-xs text-muted">
              {openGiveaway ? `${giveawayCountdown} · Enter now →` : "Stay tuned for the next draw"}
            </p>
          </Card>
        </Link>
      </div>

      {/* 2-Column Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {/* Season Leaderboard Mini-list */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-arsenal-gold" />
              <h2 className="font-display text-xl text-foreground">SEASON LEADERBOARD</h2>
            </div>
            <Link
              href="/portal/leaderboard"
              className="text-xs font-semibold text-arsenal-gold transition-colors hover:text-white"
            >
              Full table →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-surface-border border-t border-surface-border">
            {top5.map((row, i) => (
              <div
                key={row.memberId}
                className={`flex items-center justify-between py-3 text-sm ${
                  row.isMe ? "rounded-lg bg-arsenal-red/10 px-2.5 font-bold text-arsenal-red-bright" : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={i === 0 ? "font-display text-base text-arsenal-gold" : "text-xs text-muted"}>
                    {i + 1}
                  </span>
                  <span className="truncate">{row.name}</span>
                  {row.isMe && (
                    <span className="rounded bg-arsenal-red px-1.5 py-0.5 text-[10px] text-white">You</span>
                  )}
                </div>
                <span className="font-semibold text-arsenal-gold">{row.points} pts</span>
              </div>
            ))}
            {top5.length === 0 && (
              <p className="py-6 text-center text-xs text-muted">No predictions scored yet this season.</p>
            )}
          </div>
        </div>

        {/* Watch Parties Near You Mini-list */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-arsenal-gold" />
              <h2 className="font-display text-xl text-foreground">
                WATCH PARTIES NEAR {member.stateOfResidence.toUpperCase()}
              </h2>
            </div>
            <Link
              href="/portal/watch-parties"
              className="text-xs font-semibold text-arsenal-gold transition-colors hover:text-white"
            >
              All locations →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-surface-border border-t border-surface-border">
            {localParties && localParties.length > 0 ? (
              localParties.map((wp) => (
                <div key={wp.id} className="py-3 text-sm">
                  <p className="font-semibold text-foreground">{wp.venue_name}</p>
                  <p className="text-xs text-muted">
                    {wp.city}, {wp.state} {wp.is_recurring ? "· Weekly meetup" : ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-muted">
                <p>No listings in {member.stateOfResidence} yet.</p>
                <Link
                  href="/portal/watch-parties"
                  className="mt-2 inline-block font-semibold text-arsenal-gold hover:underline"
                >
                  Submit a venue →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
