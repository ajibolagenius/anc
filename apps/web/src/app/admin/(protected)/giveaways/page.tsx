import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ACTIVITY_TIERS } from "@anc/shared";
import { inputClassName } from "@/components/form-field";
import { createGiveaway } from "./actions";
import { PageHeader } from "@/components/page-header";
import { GiftIcon } from "@/components/icons";

export default async function GiveawaysPage() {
  const supabase = createServiceRoleClient();
  const { data: giveaways, error } = await supabase
    .from("giveaways")
    .select("id, title, type, status, created_at, giveaway_entries(count)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader icon={GiftIcon} title="Giveaways" />

      <form action={createGiveaway} className="mt-6 flex flex-col gap-4 rounded-2xl border border-surface-border p-5 max-w-xl">
        <h2 className="text-sm font-medium text-foreground/90">New giveaway</h2>
        <input name="title" required placeholder="2026/27 Home Kit Annual Giveaway" className={inputClassName} />
        <textarea name="description" placeholder="Description (optional)" rows={2} className={inputClassName} />
        <select name="type" defaultValue="jersey" className={inputClassName}>
          <option value="jersey">Jersey</option>
          <option value="poll">Poll</option>
          <option value="other">Other</option>
        </select>
        <div>
          <p className="mb-2 text-xs text-muted">Eligible tiers</p>
          <div className="flex gap-4 text-sm">
            {ACTIVITY_TIERS.filter((t) => t !== "pending").map((tier) => (
              <label key={tier} className="flex items-center gap-1.5">
                <input type="checkbox" name="eligibilityTiers" value={tier} defaultChecked className="h-3.5 w-3.5" />
                {tier}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="self-start rounded-full bg-arsenal-red px-6 py-2.5 text-sm font-medium text-white hover:scale-[1.02]"
        >
          Create giveaway
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-arsenal-red-bright">{error.message}</p>}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-surface-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Entries</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {giveaways?.map((g) => (
              <tr key={g.id} className="border-b border-surface-border/60 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/giveaways/${g.id}`} className="text-foreground hover:text-arsenal-gold">
                    {g.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted capitalize">{g.type}</td>
                <td className="px-4 py-3 text-muted capitalize">{g.status.replace("_", " ")}</td>
                <td className="px-4 py-3 text-muted">{g.giveaway_entries?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3 text-muted">{new Date(g.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {giveaways?.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">No giveaways yet — create the first one above.</p>
        )}
      </div>
    </div>
  );
}
