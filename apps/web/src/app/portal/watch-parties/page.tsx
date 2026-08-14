import Link from "next/link";
import { createSessionClient } from "@/lib/supabase/server-session";
import { NIGERIAN_STATES } from "@anc/shared";
import { inputClassName } from "@/components/form-field";
import { submitWatchParty } from "./actions";

type SearchParams = { state?: string };

export default async function WatchPartiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createSessionClient();

  const { data: userData } = await supabase.auth.getUser();
  const { data: me } = await supabase
    .from("members")
    .select("id, activity_tier, state_of_residence")
    .eq("auth_user_id", userData.user!.id)
    .single();

  const state = params.state ?? me?.state_of_residence ?? "";

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent, kickoff_at")
    .order("kickoff_at", { ascending: false });

  // RLS (watch_parties_select) already scopes rows to approved listings plus
  // my own pending/rejected submissions — filtering by state here is purely
  // a display convenience, not a security boundary.
  let query = supabase
    .from("watch_parties")
    .select("id, match_id, state, city, venue_name, address, map_link, contact_name, contact_whatsapp, is_recurring, status, submitted_by_member_id")
    .order("created_at", { ascending: false });
  if (state) query = query.eq("state", state);
  const { data: listings } = await query;
  const opponentByMatchId = new Map((matches ?? []).map((m) => [m.id, m.opponent]));

  const approved = (listings ?? []).filter((w) => w.status === "approved");
  const mine = (listings ?? []).filter((w) => w.status !== "approved" && w.submitted_by_member_id === me?.id);

  const canSubmit = me?.activity_tier === "active";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground">Watch Parties</h1>
      <p className="mt-2 text-sm text-muted">Find (or start) an ANC meetup for the next big match.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Filter by state:</span>
        <Link
          href="/portal/watch-parties?state="
          className={`rounded-full border px-3 py-1 ${state === "" ? "border-arsenal-gold text-arsenal-gold" : "border-surface-border text-muted"}`}
        >
          All states
        </Link>
        {me?.state_of_residence && (
          <Link
            href={`/portal/watch-parties?state=${encodeURIComponent(me.state_of_residence)}`}
            className={`rounded-full border px-3 py-1 ${state === me.state_of_residence ? "border-arsenal-gold text-arsenal-gold" : "border-surface-border text-muted"}`}
          >
            My state ({me.state_of_residence})
          </Link>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {approved.map((w) => (
          <div key={w.id} className="rounded-xl border border-surface-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-foreground">{w.venue_name}</h2>
                <p className="text-sm text-muted">
                  {w.city}, {w.state}
                </p>
              </div>
              {w.is_recurring && (
                <span className="shrink-0 rounded-full border border-surface-border px-3 py-1 text-xs text-muted">Recurring</span>
              )}
            </div>
            {w.match_id && opponentByMatchId.has(w.match_id) && (
              <p className="mt-2 text-sm text-arsenal-gold">For: vs {opponentByMatchId.get(w.match_id)}</p>
            )}
            {w.address && <p className="mt-2 text-sm text-muted">{w.address}</p>}
            {w.map_link && (
              <a href={w.map_link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-whatsapp-green hover:underline">
                Open in maps
              </a>
            )}
            {w.contact_name && (
              <p className="mt-2 text-sm text-muted">
                Contact: {w.contact_name} {w.contact_whatsapp ? `(${w.contact_whatsapp})` : ""}
              </p>
            )}
          </div>
        ))}
        {approved.length === 0 && (
          <p className="text-sm text-muted">No listings {state ? `in ${state}` : ""} yet — be the first to submit one below.</p>
        )}
      </div>

      {mine.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg text-foreground">Your submissions</h2>
          <div className="mt-3 flex flex-col gap-2">
            {mine.map((w) => (
              <div key={w.id} className="rounded-xl border border-surface-border p-4 text-sm">
                <span className="text-foreground">{w.venue_name}</span>
                <span className="ml-2 capitalize text-muted">— {w.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 rounded-xl border border-surface-border p-5">
        <h2 className="text-sm font-medium text-foreground/90">Submit a watch party</h2>
        {canSubmit ? (
          <form action={submitWatchParty} className="mt-4 flex flex-col gap-4">
            <select name="matchId" defaultValue="" className={inputClassName}>
              <option value="">Not tied to a specific fixture (recurring venue)</option>
              {matches?.map((m) => (
                <option key={m.id} value={m.id}>
                  vs {m.opponent} — {new Date(m.kickoff_at).toLocaleDateString()}
                </option>
              ))}
            </select>
            <select name="state" required defaultValue={me?.state_of_residence ?? ""} className={inputClassName}>
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
              Recurring venue
            </label>
            <button
              type="submit"
              className="self-start rounded-full bg-arsenal-red px-6 py-2.5 text-sm font-medium text-white hover:scale-[1.02]"
            >
              Submit for approval
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Listing submissions are open to active-tier members for now — keep engaging with the community and this'll unlock.
          </p>
        )}
      </div>
    </div>
  );
}
