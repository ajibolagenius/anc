import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-10">
      <h1 className="font-display text-4xl text-foreground">Privacy Notice</h1>
      <p className="mt-2 text-sm text-muted">Last updated 2026 · Arsenal Nigeria Community (ANC)</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="font-display text-lg text-foreground">What we collect</h2>
          <p className="mt-2">
            When you register a Fan Pass, we store your full name, WhatsApp number, email, birthday (day and month
            only — never your birth year), state of origin/residence, favorite players, jersey size, and your
            self-reported activity level. That's it — we deliberately don't ask for anything beyond what's needed to
            run the community.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">Why we collect it</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To review and approve your membership</li>
            <li>To send you a birthday wish (email + a shoutout in the WhatsApp group)</li>
            <li>To run giveaways you're eligible for, sized to the jersey you told us</li>
            <li>To send occasional newsletters and, if you opt to submit one, watch party listings</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">Who can see it</h2>
          <p className="mt-2">
            ANC admins, for the purposes above. Other members only ever see your name — never your phone number,
            email, birthday, or state — anywhere on the platform (e.g. the predictions leaderboard).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">Your rights (NDPR)</h2>
          <p className="mt-2">
            Under the Nigeria Data Protection Act, you can ask us to delete your data at any time. Sign in to your{" "}
            <Link href="/portal/settings" className="underline hover:text-arsenal-gold">
              member portal settings
            </Link>{" "}
            to do this yourself, instantly — no need to wait on an admin. Deleting your account anonymizes your
            personal details immediately; a record of past predictions or giveaway wins may remain in aggregate
            (e.g. "a member" won this giveaway) so the community's history stays accurate, but it's no longer linked
            to your name or contact details.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">Questions</h2>
          <p className="mt-2">
            Reach out to any ANC admin in the WhatsApp group, or contact us directly if you have concerns about how
            your data is handled.
          </p>
        </section>
      </div>

      <Link href="/" className="mt-10 inline-block text-sm text-muted hover:text-foreground">
        ← Back home
      </Link>
    </div>
  );
}
