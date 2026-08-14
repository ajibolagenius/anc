import { createSessionClient } from "@/lib/supabase/server-session";
import { PageHeader } from "@/components/page-header";
import { GiftIcon } from "@/components/icons";
import { enterGiveaway } from "./actions";

export default async function MemberGiveawaysPage() {
  const supabase = await createSessionClient();

  const { data: userData } = await supabase.auth.getUser();
  const { data: me } = await supabase
    .from("members")
    .select("id, activity_tier")
    .eq("auth_user_id", userData.user!.id)
    .single();

  // RLS (giveaways_select_open) already restricts this to open/winner_selected/
  // completed giveaways visible to approved members — no extra filter needed.
  const { data: giveaways } = await supabase
    .from("giveaways")
    .select("id, title, description, type, status, eligibility_tiers")
    .order("created_at", { ascending: false });

  // RLS (giveaway_entries_select_own) auto-scopes this to my own entries.
  const { data: myEntries } = await supabase.from("giveaway_entries").select("giveaway_id");
  const enteredIds = new Set((myEntries ?? []).map((e) => e.giveaway_id));

  // RLS (giveaway_winners_select_for_members) lets any approved member see winners.
  const { data: winners } = await supabase.from("giveaway_winners").select("giveaway_id, member_id, disqualified_at");
  const wonGiveawayIds = new Set(
    (winners ?? [])
      .filter((w) => !w.disqualified_at && w.member_id === me?.id)
      .map((w) => w.giveaway_id),
  );

  return (
    <div className="max-w-2xl">
      <PageHeader icon={GiftIcon} title="Giveaways" subtitle="Provably-fair draws, open to your membership tier." />

      <div className="mt-8 flex flex-col gap-4">
        {giveaways?.map((g) => {
          const eligible = me ? g.eligibility_tiers.includes(me.activity_tier) : false;
          const entered = enteredIds.has(g.id);
          const won = wonGiveawayIds.has(g.id);

          return (
            <div key={g.id} className="rounded-2xl border border-surface-border bg-surface/40 p-5 transition-colors hover:border-arsenal-gold/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl text-foreground">{g.title}</h2>
                  {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
                </div>
                <span className="shrink-0 rounded-full border border-surface-border px-3 py-1 text-xs capitalize text-muted">
                  {g.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-4">
                {won && (
                  <p className="text-sm font-medium text-arsenal-gold">You won this one — an admin will be in touch! 🎉</p>
                )}
                {!won && g.status === "open" && entered && (
                  <p className="text-sm text-whatsapp-green">You're entered — good luck!</p>
                )}
                {!won && g.status === "open" && !entered && eligible && (
                  <form action={enterGiveaway}>
                    <input type="hidden" name="giveawayId" value={g.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-arsenal-red px-5 py-2 text-sm font-medium text-white hover:scale-[1.02]"
                    >
                      Enter
                    </button>
                  </form>
                )}
                {!won && g.status === "open" && !eligible && (
                  <p className="text-sm text-muted">Not open to your membership tier yet.</p>
                )}
                {!won && g.status !== "open" && !entered && (
                  <p className="text-sm text-muted">Entries are closed.</p>
                )}
              </div>
            </div>
          );
        })}
        {giveaways?.length === 0 && <p className="text-sm text-muted">No giveaways yet — check back soon.</p>}
      </div>
    </div>
  );
}
