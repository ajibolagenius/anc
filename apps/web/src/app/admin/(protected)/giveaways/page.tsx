import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ACTIVITY_TIERS } from "@anc/shared";
import { Badge } from "@/components/ui/badge";
import { giveawayStatusTone } from "@/components/ui/status";
import { createGiveaway } from "./actions";

export default async function GiveawaysPage() {
  const supabase = createServiceRoleClient();
  const { data: giveaways, error } = await supabase
    .from("giveaways")
    .select("id, title, type, status, created_at, eligibility_tiers, giveaway_entries(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">GIVEAWAYS</h1>
        <p className="mt-1 text-sm text-muted">
          Manage member draws, set tier eligibility, and conduct provably-fair winner selections.
        </p>
      </div>

      {/* Create Giveaway Form */}
      <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-6 sm:p-7 shadow-xl max-w-2xl">
        <div className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5 text-arsenal-gold" />
          <h2 className="font-display text-xl tracking-wide text-foreground">CREATE A NEW GIVEAWAY</h2>
        </div>

        <form action={createGiveaway} className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="giveaway-title" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
              Giveaway Title
            </label>
            <input
              id="giveaway-title"
              name="title"
              required
              placeholder="e.g. 2026/27 Home Kit Official Raffle"
              className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="giveaway-desc" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
              Description (optional)
            </label>
            <textarea
              id="giveaway-desc"
              name="description"
              placeholder="Provide context or instructions for entrants…"
              rows={2}
              className="w-full rounded-xl border border-surface-border bg-white/5 p-3 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="giveaway-type" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Type
              </label>
              <select
                id="giveaway-type"
                name="type"
                defaultValue="jersey"
                className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-3 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              >
                <option value="jersey" className="bg-arsenal-navy-deep text-foreground">Jersey</option>
                <option value="poll" className="bg-arsenal-navy-deep text-foreground">Poll</option>
                <option value="other" className="bg-arsenal-navy-deep text-foreground">Other</option>
              </select>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-muted">Eligible Tiers</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {ACTIVITY_TIERS.filter((t) => t !== "pending").map((tier) => (
                  <label key={tier} className="flex items-center gap-1.5 cursor-pointer text-xs text-foreground">
                    <input
                      type="checkbox"
                      name="eligibilityTiers"
                      value={tier}
                      defaultChecked
                      className="h-3.5 w-3.5 rounded border-surface-border bg-white/5"
                    />
                    <span className="capitalize">{tier.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <button
              type="submit"
              className="flex h-11 items-center justify-center rounded-xl bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
            >
              Publish Giveaway
            </button>
          </div>
        </form>
      </div>

      {error && <p className="mt-6 text-xs text-arsenal-red-bright">{error.message}</p>}

      {/* Giveaways List */}
      <div className="mt-10 overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Entries</th>
              <th className="px-5 py-3.5 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {giveaways?.map((g) => (
              <tr key={g.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 font-semibold text-foreground">
                  <Link href={`/admin/giveaways/${g.id}`} className="hover:text-arsenal-gold">
                    {g.title}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-xs capitalize text-muted">{g.type}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={giveawayStatusTone(g.status as any)}>
                    {g.status.toUpperCase().replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-foreground">
                  {g.giveaway_entries?.[0]?.count ?? 0}
                </td>
                <td className="px-5 py-3.5 text-right text-xs text-muted">
                  {new Date(g.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {giveaways?.length === 0 && (
          <div className="p-10 text-center text-sm text-muted">
            No giveaways created yet. Use the form above to launch the first raffle!
          </div>
        )}
      </div>
    </div>
  );
}
