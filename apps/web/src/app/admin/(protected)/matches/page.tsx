import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { matchStatusTone } from "@/components/ui/status";
import { createMatch } from "./actions";

export default async function MatchesPage() {
  const supabase = createServiceRoleClient();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, opponent, competition, kickoff_at, status, predictions(count)")
    .order("kickoff_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">MATCH FIXTURES</h1>
        <p className="mt-1 text-sm text-muted">
          Schedule Arsenal fixtures, open prediction windows, and record official scorelines.
        </p>
      </div>

      {/* New Fixture Form */}
      <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-6 sm:p-7 shadow-xl max-w-xl">
        <div className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5 text-arsenal-gold" />
          <h2 className="font-display text-xl tracking-wide text-foreground">ADD NEW FIXTURE</h2>
        </div>

        <form action={createMatch} className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="opponent" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
              Opponent
            </label>
            <input
              id="opponent"
              name="opponent"
              required
              placeholder="e.g. Chelsea, Liverpool, Tottenham"
              className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="competition" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Competition
              </label>
              <input
                id="competition"
                name="competition"
                placeholder="Premier League"
                defaultValue="Premier League"
                className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="kickoffAt" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Kickoff (WAT)
              </label>
              <input
                id="kickoffAt"
                type="datetime-local"
                name="kickoffAt"
                required
                className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-2">
            <button
              type="submit"
              className="flex h-11 items-center justify-center rounded-xl bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
            >
              Add Fixture
            </button>
          </div>
        </form>
      </div>

      {error && <p className="mt-6 text-xs text-arsenal-red-bright">{error.message}</p>}

      {/* Matches List */}
      <div className="mt-10 overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3.5">Fixture</th>
              <th className="px-5 py-3.5">Competition</th>
              <th className="px-5 py-3.5">Kickoff</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Predictions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {matches?.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 font-semibold text-foreground">
                  <Link href={`/admin/matches/${m.id}`} className="hover:text-arsenal-gold">
                    Arsenal vs {m.opponent}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted">{m.competition || "Premier League"}</td>
                <td className="px-5 py-3.5 text-xs text-muted whitespace-nowrap">
                  {new Date(m.kickoff_at).toLocaleDateString("en-NG", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={matchStatusTone(m.status as any)}>
                    {m.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs text-foreground">
                  {m.predictions?.[0]?.count ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {matches?.length === 0 && (
          <div className="p-10 text-center text-sm text-muted">
            No fixtures scheduled yet. Add the next upcoming match above!
          </div>
        )}
      </div>
    </div>
  );
}
