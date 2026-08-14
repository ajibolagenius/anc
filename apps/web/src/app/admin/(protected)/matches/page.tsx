import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { inputClassName } from "@/components/form-field";
import { createMatch } from "./actions";
import { PageHeader } from "@/components/page-header";
import { CalendarIcon } from "@/components/icons";

export default async function MatchesPage() {
  const supabase = createServiceRoleClient();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, opponent, competition, kickoff_at, status, predictions(count)")
    .order("kickoff_at", { ascending: false });

  return (
    <div>
      <PageHeader icon={CalendarIcon} title="Matches" />

      <form action={createMatch} className="mt-6 flex flex-col gap-4 rounded-2xl border border-surface-border p-5 max-w-xl">
        <h2 className="text-sm font-medium text-foreground/90">New fixture</h2>
        <input name="opponent" required placeholder="Opponent (e.g. Chelsea)" className={inputClassName} />
        <input name="competition" placeholder="Competition (optional, e.g. Premier League)" className={inputClassName} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted">Kickoff</label>
          <input type="datetime-local" name="kickoffAt" required className={inputClassName} />
        </div>
        <button
          type="submit"
          className="self-start rounded-full bg-arsenal-red px-6 py-2.5 text-sm font-medium text-white hover:scale-[1.02]"
        >
          Create fixture
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-arsenal-red-bright">{error.message}</p>}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-surface-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Opponent</th>
              <th className="px-4 py-3 font-medium">Competition</th>
              <th className="px-4 py-3 font-medium">Kickoff</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Predictions</th>
            </tr>
          </thead>
          <tbody>
            {matches?.map((m) => (
              <tr key={m.id} className="border-b border-surface-border/60 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/matches/${m.id}`} className="text-foreground hover:text-arsenal-gold">
                    vs {m.opponent}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{m.competition ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{new Date(m.kickoff_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted capitalize">{m.status}</td>
                <td className="px-4 py-3 text-muted">{m.predictions?.[0]?.count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {matches?.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">No fixtures yet — create the first one above.</p>
        )}
      </div>
    </div>
  );
}
