import { redirect } from "next/navigation";
import { createSessionClient, getMemberSession } from "@/lib/supabase/server-session";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { enterGiveaway } from "./actions";

export default async function MemberGiveawaysPage() {
  const member = await getMemberSession();
  if (!member) redirect("/login");

  const supabase = await createSessionClient();

  // Fetch giveaways visible to approved members
  const { data: giveaways } = await supabase
    .from("giveaways")
    .select("id, title, description, type, status, eligibility_tiers, entry_closes_at")
    .order("created_at", { ascending: false });

  // Fetch my entries
  const { data: myEntries } = await supabase.from("giveaway_entries").select("giveaway_id");
  const enteredIds = new Set((myEntries ?? []).map((e) => e.giveaway_id));

  // Fetch total entry counts per giveaway
  const { data: allEntries } = await supabase.from("giveaway_entries").select("giveaway_id");
  const entryCountMap = new Map<string, number>();
  for (const entry of allEntries ?? []) {
    entryCountMap.set(entry.giveaway_id, (entryCountMap.get(entry.giveaway_id) ?? 0) + 1);
  }

  // Fetch winners
  const { data: winners } = await supabase
    .from("giveaway_winners")
    .select("giveaway_id, member_id, disqualified_at");
  const wonGiveawayIds = new Set(
    (winners ?? [])
      .filter((w) => !w.disqualified_at && w.member_id === member.memberId)
      .map((w) => w.giveaway_id),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">GIVEAWAYS</h1>
        <p className="mt-1 text-sm text-muted">
          Provably-fair random draws, open to verified members based on your activity tier.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {giveaways?.map((g) => {
          const eligible = g.eligibility_tiers.includes(member.activityTier);
          const entered = enteredIds.has(g.id);
          const won = wonGiveawayIds.has(g.id);
          const isOpen = g.status === "open";
          const entryCount = entryCountMap.get(g.id) ?? 0;

          let closeText = "Open";
          if (g.entry_closes_at) {
            closeText = `Closes ${new Date(g.entry_closes_at).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            })}`;
          }

          return (
            <Card
              key={g.id}
              highlight={isOpen && eligible && !entered}
              className={`p-6 transition-all ${!isOpen && !won ? "opacity-75" : ""}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display text-xl tracking-wide text-foreground">{g.title}</h2>
                    {won && <Badge tone="gold">YOU WON! 🎉</Badge>}
                    {!won && entered && <Badge tone="green">ENTERED ✓</Badge>}
                    {!won && !isOpen && <Badge tone="neutral">CLOSED</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {isOpen ? `${closeText} · ${entryCount} ${entryCount === 1 ? "entry" : "entries"}` : `Closed · ${entryCount} entries`}
                  </p>
                  {g.description && <p className="mt-2 text-sm text-foreground/80">{g.description}</p>}
                </div>

                <div className="shrink-0">
                  {isOpen && !entered && eligible && (
                    <form action={enterGiveaway}>
                      <input type="hidden" name="giveawayId" value={g.id} />
                      <button
                        type="submit"
                        className="flex h-10 items-center justify-center rounded-full bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
                      >
                        Enter Draw
                      </button>
                    </form>
                  )}

                  {isOpen && !entered && !eligible && (
                    <span className="text-xs text-muted">Tier not eligible</span>
                  )}

                  {isOpen && entered && (
                    <span className="text-xs font-semibold text-whatsapp-green">You&apos;re in the draw</span>
                  )}

                  {!isOpen && !won && !entered && (
                    <span className="text-xs text-muted">You didn&apos;t enter</span>
                  )}

                  {won && (
                    <span className="text-xs font-bold text-arsenal-gold">Check your email / WhatsApp</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {giveaways?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-surface-border p-10 text-center text-sm text-muted">
            No active giveaways at the moment. Stay tuned in the WhatsApp group!
          </div>
        )}
      </div>
    </div>
  );
}
