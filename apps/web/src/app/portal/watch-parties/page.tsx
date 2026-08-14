import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon, ArrowSquareOutIcon, MapPinIcon } from "@phosphor-icons/react/ssr";
import { createSessionClient, getMemberSession } from "@/lib/supabase/server-session";
import { NIGERIAN_STATES } from "@anc/shared";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { submitWatchParty } from "./actions";

type SearchParams = { state?: string };

export default async function WatchPartiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const member = await getMemberSession();
  if (!member) redirect("/login");

  const params = await searchParams;
  const selectedState = params.state ?? member.stateOfResidence ?? "";

  const supabase = await createSessionClient();

  // Upcoming matches
  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent, kickoff_at")
    .eq("status", "upcoming")
    .order("kickoff_at", { ascending: true })
    .limit(1);
  const nextMatch = matches?.[0] ?? null;

  // Listings query
  let query = supabase
    .from("watch_parties")
    .select(
      "id, match_id, state, city, venue_name, address, map_link, contact_name, contact_whatsapp, is_recurring, status, submitted_by_member_id, created_at",
    )
    .order("created_at", { ascending: false });

  if (selectedState) {
    query = query.eq("state", selectedState);
  }

  const { data: listings } = await query;

  const approved = (listings ?? []).filter((w) => w.status === "approved");
  const mine = (listings ?? []).filter(
    (w) => w.submitted_by_member_id === member.memberId && w.status !== "approved",
  );

  const canSubmit = member.activityTier === "active" || member.activityTier === "semi_active";

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">WATCH PARTIES</h1>
        <p className="mt-1 text-sm text-muted">
          Find a local meetup for the next match, or submit your favorite spot for community screening.
        </p>
      </div>

      {/* State Filter Chips (Scrollable) */}
      <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href="/portal/watch-parties?state="
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
            selectedState === ""
              ? "bg-arsenal-red text-white"
              : "border border-surface-border text-muted hover:border-arsenal-gold/50 hover:text-foreground"
          }`}
        >
          All States
        </Link>
        {NIGERIAN_STATES.map((s) => (
          <Link
            key={s}
            href={`/portal/watch-parties?state=${encodeURIComponent(s)}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              selectedState === s
                ? "bg-arsenal-red text-white"
                : "border border-surface-border text-muted hover:border-arsenal-gold/50 hover:text-foreground"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Next Fixture Banner */}
      {nextMatch && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-border bg-arsenal-navy-deep p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arsenal-red/20 font-display text-xs text-arsenal-red-bright">
              KO
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-muted">NEXT MATCHDAY</p>
              <p className="font-display text-base tracking-wide text-white">
                ARSENAL VS {nextMatch.opponent.toUpperCase()}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-arsenal-gold">
            {new Date(nextMatch.kickoff_at).toLocaleDateString("en-NG", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Approved Listings */}
      <div className="mt-8 flex flex-col gap-4">
        {approved.map((wp) => (
          <Card key={wp.id} className="p-6 transition-all hover:border-arsenal-gold/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-xl tracking-wide text-foreground">{wp.venue_name}</h2>
                  {wp.is_recurring ? (
                    <Badge tone="blue">RECURRING</Badge>
                  ) : (
                    <Badge tone="gold">THIS FIXTURE</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {wp.city}, {wp.state} {wp.address ? `· ${wp.address}` : ""}
                </p>
              </div>

              {wp.map_link && (
                <a
                  href={wp.map_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 text-xs font-semibold text-whatsapp-green hover:underline"
                >
                  <span>Map</span>
                  <ArrowSquareOutIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {wp.contact_name && (
              <div className="mt-4 flex items-center gap-2 border-t border-surface-border pt-3 text-xs text-muted">
                <span>Contact: {wp.contact_name}</span>
                {wp.contact_whatsapp && (
                  <span className="text-foreground font-medium">({wp.contact_whatsapp})</span>
                )}
              </div>
            )}
          </Card>
        ))}

        {approved.length === 0 && (
          <div className="rounded-2xl border border-dashed border-surface-border p-10 text-center text-sm text-muted">
            No approved watch parties {selectedState ? `in ${selectedState}` : ""} yet.
          </div>
        )}
      </div>

      {/* Your Submissions Section */}
      {mine.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl tracking-wide text-foreground">YOUR SUBMISSIONS</h2>
          <div className="mt-4 flex flex-col gap-3">
            {mine.map((wp) => (
              <div
                key={wp.id}
                className="flex items-center justify-between rounded-xl border border-surface-border bg-surface p-4 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{wp.venue_name}</p>
                  <p className="text-xs text-muted">
                    {wp.city}, {wp.state} · Submitted {new Date(wp.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <Badge tone={wp.status === "rejected" ? "red" : "gold"}>
                  {wp.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Venue Section */}
      <div className="mt-12 rounded-2xl border border-surface-border bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <PlusIcon className="h-5 w-5 text-arsenal-gold" />
          <h2 className="font-display text-xl tracking-wide text-foreground">SUBMIT A VENUE</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Know a great viewing centre or sports bar? Submit it for admin review.
        </p>

        {canSubmit ? (
          <form action={submitWatchParty} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="venueName" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Venue Name
              </label>
              <input
                id="venueName"
                name="venueName"
                required
                placeholder="e.g. Emirates Lounge & Sports Bar"
                className="h-[44px] w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="wp-state" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                State
              </label>
              <select
                id="wp-state"
                name="state"
                required
                defaultValue={member.stateOfResidence}
                className="h-[44px] w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-arsenal-navy-deep text-foreground">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                City / Area
              </label>
              <input
                id="city"
                name="city"
                required
                placeholder="e.g. Ikeja"
                className="h-[44px] w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Full Address (optional)
              </label>
              <input
                id="address"
                name="address"
                placeholder="e.g. 14 Allen Avenue, Ikeja"
                className="h-[44px] w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contactName" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Contact Name (optional)
              </label>
              <input
                id="contactName"
                name="contactName"
                placeholder="e.g. Femi"
                className="h-[44px] w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contactWhatsapp" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Contact WhatsApp (optional)
              </label>
              <input
                id="contactWhatsapp"
                name="contactWhatsapp"
                placeholder="e.g. +234 801 234 5678"
                className="h-[44px] w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground/90">
                <input type="checkbox" name="isRecurring" className="h-4 w-4 rounded border-surface-border bg-white/5" />
                <span>Recurring weekly venue (hosts every Arsenal matchday)</span>
              </label>
            </div>

            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                className="flex h-11 items-center justify-center rounded-xl bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
              >
                Submit Venue for Review
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-xs text-muted">
            Submissions are unlocked for active community members. Keep participating in the group and this will
            open up!
          </p>
        )}
      </div>
    </div>
  );
}
