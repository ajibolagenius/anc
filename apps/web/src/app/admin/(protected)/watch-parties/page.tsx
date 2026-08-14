import { createServiceRoleClient } from "@/lib/supabase/server";
import { NIGERIAN_STATES } from "@anc/shared";
import { inputClassName } from "@/components/form-field";
import { createWatchParty, approveWatchParty, rejectWatchParty } from "./actions";

export default async function AdminWatchPartiesPage() {
  const supabase = createServiceRoleClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent, kickoff_at")
    .order("kickoff_at", { ascending: false });

  const { data: listings, error } = await supabase
    .from("watch_parties")
    .select("id, match_id, state, city, venue_name, address, map_link, contact_name, contact_whatsapp, is_recurring, submitted_by, submitted_by_member_id, status, created_at")
    .order("created_at", { ascending: false });

  const submitterIds = [...new Set((listings ?? []).map((w) => w.submitted_by_member_id).filter((id) => id !== null))];
  const { data: submitters } = submitterIds.length
    ? await supabase.from("members").select("id, full_name").in("id", submitterIds)
    : { data: [] };
  const nameByMemberId = new Map((submitters ?? []).map((m) => [m.id, m.full_name]));
  const opponentByMatchId = new Map((matches ?? []).map((m) => [m.id, m.opponent]));

  const pending = (listings ?? []).filter((w) => w.status === "pending");
  const rest = (listings ?? []).filter((w) => w.status !== "pending");

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Watch Parties</h1>

      <form action={createWatchParty} className="mt-6 flex flex-col gap-4 rounded-xl border border-surface-border p-5 max-w-xl">
        <h2 className="text-sm font-medium text-foreground/90">New listing (auto-approved)</h2>
        <select name="matchId" defaultValue="" className={inputClassName}>
          <option value="">Not tied to a specific fixture (recurring venue)</option>
          {matches?.map((m) => (
            <option key={m.id} value={m.id}>
              vs {m.opponent} — {new Date(m.kickoff_at).toLocaleDateString()}
            </option>
          ))}
        </select>
        <select name="state" required defaultValue="" className={inputClassName}>
          <option value="" disabled>
            State
          </option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input name="city" required placeholder="City" className={inputClassName} />
        <input name="venueName" required placeholder="Venue name" className={inputClassName} />
        <input name="address" placeholder="Address (optional)" className={inputClassName} />
        <input name="mapLink" placeholder="Map link (optional)" className={inputClassName} />
        <input name="contactName" placeholder="Contact name (optional)" className={inputClassName} />
        <input name="contactWhatsapp" placeholder="Contact WhatsApp (optional)" className={inputClassName} />
        <label className="flex items-center gap-1.5 text-sm text-foreground/90">
          <input type="checkbox" name="isRecurring" className="h-3.5 w-3.5" />
          Recurring venue (not just for one fixture)
        </label>
        <button
          type="submit"
          className="self-start rounded-full bg-arsenal-red px-6 py-2.5 text-sm font-medium text-white hover:scale-[1.02]"
        >
          Post listing
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-arsenal-red-bright">{error.message}</p>}

      {pending.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-arsenal-gold">Pending approval</h2>
          <div className="mt-3 flex flex-col gap-3">
            {pending.map((w) => (
              <div key={w.id} className="rounded-xl border border-arsenal-gold/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm">
                    <p className="text-foreground">
                      {w.venue_name} · {w.city}, {w.state}
                    </p>
                    <p className="mt-1 text-muted">
                      Submitted by {nameByMemberId.get(w.submitted_by_member_id ?? "") ?? "a member"}
                      {w.match_id && opponentByMatchId.has(w.match_id) ? ` · for vs ${opponentByMatchId.get(w.match_id)}` : ""}
                    </p>
                    {w.address && <p className="mt-1 text-muted">{w.address}</p>}
                    {w.contact_name && (
                      <p className="mt-1 text-muted">
                        Contact: {w.contact_name} {w.contact_whatsapp ? `(${w.contact_whatsapp})` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={approveWatchParty}>
                      <input type="hidden" name="id" value={w.id} />
                      <button type="submit" className="rounded-full bg-whatsapp-green px-4 py-1.5 text-xs font-medium text-white hover:scale-[1.02]">
                        Approve
                      </button>
                    </form>
                    <form action={rejectWatchParty}>
                      <input type="hidden" name="id" value={w.id} />
                      <button type="submit" className="rounded-full border border-surface-border px-4 py-1.5 text-xs text-muted hover:text-arsenal-red-bright">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Venue</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Submitted by</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((w) => (
              <tr key={w.id} className="border-b border-surface-border/60 last:border-0">
                <td className="px-4 py-3 text-foreground">{w.venue_name}</td>
                <td className="px-4 py-3 text-muted">
                  {w.city}, {w.state}
                </td>
                <td className="px-4 py-3 text-muted capitalize">
                  {w.submitted_by === "admin" ? "Admin" : nameByMemberId.get(w.submitted_by_member_id ?? "") ?? "a member"}
                </td>
                <td className="px-4 py-3 text-muted capitalize">{w.status}</td>
                <td className="px-4 py-3 text-muted">{new Date(w.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rest.length === 0 && pending.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">No listings yet — post the first one above.</p>
        )}
      </div>
    </div>
  );
}
