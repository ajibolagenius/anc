import Link from "next/link";
import { ArrowRightIcon, ChatIcon } from "@/components/icons";
import { SITE, WHATSAPP_GROUP_INVITE_URL } from "@/lib/site-config";

const CULTURE = [
  {
    title: "Banter & Debate",
    body: "Matchday arguments, tactical hot takes, and the odd rivalry roast — the group never runs dry.",
  },
  {
    title: "Jersey Giveaway",
    body: "Our annual home-kit giveaway, drawn fair and square, plus one-off surprises through the year.",
  },
  {
    title: "Matchday Culture",
    body: "Predictions, watch parties across Nigeria, and everything else that makes following Arsenal a shared thing.",
  },
];

const PLATFORM_ADDS = [
  "A digital ANC Fan Pass with your own membership number",
  "Birthday shoutouts — in your inbox and in the group",
  "A fairer, auditable giveaway draw",
  "Match predictions with a season leaderboard",
  "A watch-party locator for your state",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-display text-2xl tracking-wide text-foreground">
          {SITE.shortName}
        </span>
        <Link
          href={WHATSAPP_GROUP_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-sm text-muted transition-colors hover:border-whatsapp-green hover:text-foreground"
        >
          <ChatIcon className="h-4 w-4" />
          Join the group
        </Link>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-6 py-24 sm:px-10 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0 -z-10 texture-dots [mask-image:radial-gradient(ellipse_60%_60%_at_30%_30%,black,transparent)]"
          aria-hidden
        />
        <p className="animate-fade-in-up font-display text-sm tracking-[0.3em] text-arsenal-gold uppercase [animation-delay:0ms]">
          Arsenal Nigeria Community
        </p>
        <h1 className="animate-fade-in-up mt-4 max-w-3xl font-display text-6xl leading-[0.95] text-foreground sm:text-8xl [animation-delay:80ms]">
          {SITE.tagline}
        </h1>
        <p className="animate-fade-in-up mt-6 max-w-xl text-lg text-muted [animation-delay:160ms]">
          The community lives on WhatsApp — the banter, the giveaways, the matchday chaos.
          This site is just here to back it up: your fan pass, your birthday shoutout,
          your giveaway history, all in one place.
        </p>
        <div className="animate-fade-in-up mt-10 flex flex-col gap-4 sm:flex-row [animation-delay:240ms]">
          <Link
            href={WHATSAPP_GROUP_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 rounded-full bg-whatsapp-green px-7 py-3.5 text-base font-medium text-arsenal-navy-deep transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <ChatIcon className="h-5 w-5" />
            Join the WhatsApp Group
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-full border border-surface-border px-7 py-3.5 text-base font-medium text-foreground transition-colors hover:border-arsenal-gold hover:bg-white/5"
          >
            Get your Fan Pass
          </Link>
        </div>
      </section>

      {/* Culture strip */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
        <div className="grid gap-6 sm:grid-cols-3">
          {CULTURE.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-surface-border bg-surface/60 p-6 transition-colors hover:border-arsenal-red/40"
            >
              <h3 className="font-display text-xl tracking-wide text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supporting-platform section — deliberately quieter than the hero */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
        <div className="rounded-3xl border border-surface-border bg-surface/40 p-8 sm:p-12">
          <h2 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
            Beyond the group
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            None of this replaces the WhatsApp group — it just gives it a memory.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {PLATFORM_ADDS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-arsenal-red" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-arsenal-gold hover:text-foreground"
          >
            Register as a member
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-2 border-t border-surface-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Arsenal Nigeria Community. Fan-run, not affiliated with Arsenal FC.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <a href="https://ajibolagenius.vercel.app" target="_blank" rel="noreferrer" className="hover:text-foreground">
              Built with love by Ajibola Don_Genius
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
