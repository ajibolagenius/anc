import Link from "next/link";
import {
  ArrowRightIcon,
  BellIcon,
  CakeIcon,
  CalendarIcon,
  ChatIcon,
  GiftIcon,
  MapPinIcon,
  ShieldIcon,
  SparkleIcon,
  TrophyIcon,
} from "@/components/icons";
import { SITE, WHATSAPP_GROUP_INVITE_URL } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#how-it-works", label: "How it works" },
];

const FEATURES = [
  {
    icon: ShieldIcon,
    title: "Digital Fan Pass",
    body: "Your own ANC membership number and profile — jersey size, favorite players, all on file so you never fill a form twice.",
    spotlight: "var(--arsenal-red)",
    span: "sm:col-span-2",
  },
  {
    icon: GiftIcon,
    title: "Giveaways & Jersey Raffles",
    body: "Provably-fair random draws, full winner history, every entry logged.",
    spotlight: "var(--arsenal-gold)",
  },
  {
    icon: CalendarIcon,
    title: "Matchday Predictions",
    body: "Call the scoreline and first scorer, climb the season leaderboard.",
    spotlight: "var(--arsenal-red)",
  },
  {
    icon: MapPinIcon,
    title: "Watch Party Locator",
    body: "Find (or start) a matchday meetup wherever you are in Nigeria.",
    spotlight: "var(--arsenal-gold)",
  },
  {
    icon: CakeIcon,
    title: "Birthday Shoutouts",
    body: "An email and a group mention on your day, every year, automatically.",
    spotlight: "var(--arsenal-red)",
  },
  {
    icon: BellIcon,
    title: "News & Newsletters",
    body: "A curated Arsenal digest every morning, and the occasional word from the admins.",
    spotlight: "var(--arsenal-gold)",
    span: "sm:col-span-2",
  },
];

const STATS = [
  { value: "07:00", label: "WAT daily birthday shoutout" },
  { value: "36", label: "states, one watch-party map" },
  { value: "4 pts", label: "max score for a perfect prediction" },
  { value: "100%", label: "fan-run, zero affiliation with Arsenal FC" },
];

const STEPS = [
  {
    n: "01",
    title: "Join the WhatsApp group",
    body: "That's the whole community — banter, debate, matchday chaos. Everything else backs this up.",
  },
  {
    n: "02",
    title: "Get your Fan Pass",
    body: "A two-minute form gets you a membership number, and puts you in line for birthdays and giveaways.",
  },
  {
    n: "03",
    title: "An admin approves you",
    body: "Once approved, sign in any time to enter giveaways, predict matches, and find a watch party near you.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="sticky top-0 z-20 border-b border-surface-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
          <span className="font-display text-2xl tracking-wide text-foreground">{SITE.shortName}</span>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/login" className="text-sm text-muted transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link
              href={WHATSAPP_GROUP_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-sm text-muted transition-colors hover:border-whatsapp-green hover:text-foreground"
            >
              <ChatIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Join the group</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-6 py-24 sm:px-10 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0 -z-10 texture-dots [mask-image:radial-gradient(ellipse_60%_60%_at_30%_30%,black,transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-10 -z-10 h-72 w-72 rounded-full bg-arsenal-red/20 blur-3xl animate-glow"
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

        {/* Floating stat chip — a small nod to whatsapp.com's habit of surfacing one bold number near the hero */}
        <div className="animate-fade-in-up mt-14 flex items-center gap-3 rounded-2xl border border-surface-border bg-surface/60 px-5 py-3 [animation-delay:320ms]">
          <SparkleIcon className="h-5 w-5 shrink-0 text-arsenal-gold" />
          <p className="text-sm text-foreground/90">
            <span className="font-medium">One group, one home</span> — every Gunner in Nigeria, in the same place.
          </p>
        </div>
      </section>

      {/* Qualitative stats band */}
      <section className="section-glow-red border-y border-surface-border/60">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4 sm:px-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1.5">
              <span className="stat-gradient font-display text-4xl sm:text-5xl">{stat.value}</span>
              <span className="text-xs text-muted sm:text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature bento grid */}
      <section id="platform" className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div className="max-w-2xl">
          <p className="font-display text-sm tracking-[0.3em] text-arsenal-gold uppercase">The platform</p>
          <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Everything the group doesn&apos;t have room for</h2>
          <p className="mt-4 text-muted">
            None of this replaces the WhatsApp group — it just gives it a memory, a fair draw, and a scoreboard.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-3xl border border-surface-border bg-surface/60 p-7 transition-colors hover:border-arsenal-gold/40 ${feature.span ?? ""}`}
            >
              <div className="icon-spotlight inline-flex" style={{ ["--spotlight-color" as string]: feature.spotlight }}>
                <feature.icon className="h-8 w-8 text-foreground transition-transform group-hover:scale-110" />
              </div>
              <h3 className="mt-5 font-display text-xl tracking-wide text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section-glow-gold border-y border-surface-border/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
          <p className="font-display text-sm tracking-[0.3em] text-arsenal-gold uppercase">How it works</p>
          <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Three steps, in order</h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="font-display text-5xl text-arsenal-red/30">{step.n}</span>
                <h3 className="mt-3 font-display text-xl tracking-wide text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard/community teaser — deliberately quieter, reinforcing the group stays the point */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div className="grid gap-8 rounded-3xl border border-surface-border bg-surface/40 p-8 sm:grid-cols-[1fr_auto] sm:items-center sm:p-12">
          <div>
            <div className="flex items-center gap-2 text-arsenal-gold">
              <TrophyIcon className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.2em]">Season leaderboard</span>
            </div>
            <h2 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">Banter fuel, not fantasy football</h2>
            <p className="mt-3 max-w-xl text-sm text-muted">
              Predict the scoreline, call the first scorer, and see where you land against every other Gunner who
              bothered to guess. Lightweight, for bragging rights only.
            </p>
          </div>
          <Link
            href="/login"
            className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-surface-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-arsenal-gold hover:bg-white/5"
          >
            Sign in to predict
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Closing CTA band */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-br from-arsenal-red/20 via-surface to-surface p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-arsenal-gold/20 blur-3xl" aria-hidden />
          <h2 className="font-display text-3xl text-foreground sm:text-5xl">Come on you Gunners</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted sm:text-base">
            Two minutes to a Fan Pass. A lifetime of bragging rights in the group.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={WHATSAPP_GROUP_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 rounded-full bg-whatsapp-green px-7 py-3.5 text-base font-medium text-arsenal-navy-deep transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <ChatIcon className="h-5 w-5" />
              Join the WhatsApp Group
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-full border border-surface-border px-7 py-3.5 text-base font-medium text-foreground transition-colors hover:border-arsenal-gold hover:bg-white/5"
            >
              Get your Fan Pass
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-border/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10">
          <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <span className="font-display text-2xl tracking-wide text-foreground">{SITE.shortName}</span>
              <p className="mt-3 max-w-xs text-sm text-muted">
                A Nigerian home for Arsenal fans — banter, giveaways, matchday culture, and a WhatsApp group at the
                center of it all.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Community</p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm">
                <a href={WHATSAPP_GROUP_INVITE_URL} target="_blank" rel="noopener noreferrer" className="text-foreground/90 hover:text-foreground">
                  Join the WhatsApp group
                </a>
                <Link href="/register" className="text-foreground/90 hover:text-foreground">
                  Get your Fan Pass
                </Link>
                <Link href="/login" className="text-foreground/90 hover:text-foreground">
                  Sign in
                </Link>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Legal</p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm">
                <Link href="/privacy" className="text-foreground/90 hover:text-foreground">
                  Privacy notice
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-surface-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; {new Date().getFullYear()} Arsenal Nigeria Community. Fan-run, not affiliated with Arsenal FC.</span>
            <a href="https://ajibolagenius.vercel.app" target="_blank" rel="noreferrer" className="hover:text-foreground">
              Built with love by Ajibola Don_Genius
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
