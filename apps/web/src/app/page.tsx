import Link from "next/link";
import {
  ArrowRightIcon,
  CakeIcon,
  GiftIcon,
  IdentificationCardIcon,
  MapPinLineIcon,
  NewspaperIcon,
  SoccerBallIcon,
  TrophyIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/ssr";
import { SITE, WHATSAPP_GROUP_INVITE_URL } from "@/lib/site-config";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

const TICKER_ITEMS = [
  "482 MEMBERS",
  "36 STATES",
  "NEXT KO SAT 17:30",
  "HOME JERSEY GIVEAWAY CLOSES IN 4 DAYS",
  "07:00 WAT DAILY BIRTHDAY SHOUTOUT",
];

const STATS = [
  { value: "07:00", label: "WAT daily birthday shoutout" },
  { value: "36", label: "states, one watch-party map" },
  { value: "4 PTS", label: "max score for a perfect prediction" },
  { value: "100%", label: "fan-run, zero affiliation with Arsenal FC" },
];

const FEATURES = [
  {
    n: "01",
    icon: IdentificationCardIcon,
    title: "Digital Fan Pass",
    body: "Your own ANC membership number and profile — jersey size, favorite players, all on file so you never fill a form twice.",
  },
  {
    n: "02",
    icon: GiftIcon,
    title: "Giveaways & Jersey Raffles",
    body: "Provably-fair random draws, full winner history, every entry logged.",
  },
  {
    n: "03",
    icon: SoccerBallIcon,
    title: "Matchday Predictions",
    body: "Call the scoreline and first scorer, climb the season leaderboard.",
  },
  {
    n: "04",
    icon: MapPinLineIcon,
    title: "Watch Party Locator",
    body: "Find (or start) a matchday meetup wherever you are in Nigeria.",
  },
  {
    n: "05",
    icon: CakeIcon,
    title: "Birthday Shoutouts",
    body: "An email and a group mention on your day, every year, automatically.",
  },
  {
    n: "06",
    icon: NewspaperIcon,
    title: "News & Newsletters",
    body: "A curated Arsenal digest every morning, and the occasional word from the admins.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Join the WhatsApp group",
    body: "That's the whole community — banter, debate, matchday chaos. Everything else backs this up.",
    tone: "red" as const,
    offset: false,
  },
  {
    n: "02",
    title: "Get your Fan Pass",
    body: "A two-minute form gets you a membership number, and puts you in line for birthdays and giveaways.",
    tone: "navy" as const,
    offset: true,
  },
  {
    n: "03",
    title: "An admin approves you",
    body: "Once approved, sign in any time to enter giveaways, predict matches, and find a watch party near you.",
    tone: "red" as const,
    offset: false,
  },
];

function TickerRow() {
  return (
    <span className="flex flex-shrink-0 items-center gap-9 whitespace-nowrap px-6 py-2 font-display text-[13px] tracking-[0.08em] text-white">
      {TICKER_ITEMS.map((item, i) => (
        <span key={i} className="flex items-center gap-9">
          {item}
          <span aria-hidden="true">·</span>
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <MarketingHeader />

      {/* Ticker */}
      <div className="overflow-hidden bg-arsenal-red">
        <div className="flex w-max animate-anc-marquee">
          <TickerRow />
          <TickerRow />
        </div>
      </div>

      {/* Hero — centered variant (the mockup's own configured default) */}
      <section
        className="relative isolate flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center sm:px-10"
        style={{
          backgroundImage: "radial-gradient(ellipse 60% 60% at 50% 30%, rgba(219,0,7,.22), transparent 60%)",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[-40px] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[300px] leading-none text-transparent"
          style={{ WebkitTextStroke: "2px rgba(255,255,255,.06)" }}
        >
          ARSENAL
        </span>
        <div className="relative z-10 max-w-[720px]">
          <p className="font-display text-sm tracking-[0.3em] text-arsenal-gold">ARSENAL NIGERIA COMMUNITY</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.95] text-foreground sm:text-8xl">
            {SITE.tagline.toUpperCase()}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            The community lives on WhatsApp — the banter, the giveaways, the matchday chaos. This site is just here
            to back it up.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href={WHATSAPP_GROUP_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] items-center gap-2 rounded-full bg-whatsapp-green px-7 text-[15px] font-bold text-arsenal-navy-deep transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <WhatsappLogoIcon weight="fill" className="h-5 w-5" />
              Join the WhatsApp Group
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="flex h-[52px] items-center rounded-full border border-surface-border px-7 text-[15px] font-bold text-foreground transition-colors hover:border-arsenal-gold hover:bg-white/5"
            >
              Get your Fan Pass
            </Link>
          </div>
        </div>
      </section>

      {/* 4-stat band */}
      <section
        className="relative overflow-hidden border-y border-surface-border bg-[#050f24]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-35deg, rgba(219,0,7,.08) 0 2px, transparent 2px 26px)",
        }}
      >
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-2 px-6 py-11 sm:grid-cols-4 sm:px-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-l-2 border-arsenal-gold px-6 py-2">
              <div className="font-display text-4xl text-arsenal-red-bright">{stat.value}</div>
              <div className="mt-1.5 text-xs uppercase tracking-[0.06em] text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform — numbered feature list */}
      <section id="platform" className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="font-display text-sm tracking-[0.3em] text-arsenal-gold">THE PLATFORM</p>
            <h2 className="mt-2.5 font-display text-4xl text-foreground sm:text-5xl">
              EVERYTHING THE GROUP DOESN&apos;T HAVE ROOM FOR
            </h2>
          </div>
          <p className="max-w-[280px] text-sm text-muted">
            None of this replaces the WhatsApp group — it just gives it a memory, a fair draw, and a scoreboard.
          </p>
        </div>

        <div className="mt-12 border-t border-surface-border">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.n}
                className="grid grid-cols-[56px_1fr] items-start gap-5 border-b border-surface-border py-7 sm:grid-cols-[110px_1fr]"
              >
                <div
                  className={
                    Number(feature.n) % 2 === 1
                      ? "font-display text-4xl text-arsenal-red/40 sm:text-6xl"
                      : "font-display text-4xl text-arsenal-gold/40 sm:text-6xl"
                  }
                >
                  {feature.n}
                </div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 shrink-0 text-arsenal-gold" />
                    <h3 className="font-display text-2xl tracking-[0.01em] text-foreground">{feature.title}</h3>
                  </div>
                  <p className="max-w-[460px] text-sm leading-relaxed text-muted">{feature.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-surface-border"
        style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(156,130,74,.1), transparent 70%)" }}
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
          <p className="font-display text-sm tracking-[0.3em] text-arsenal-gold">HOW IT WORKS</p>
          <h2 className="mt-2.5 font-display text-4xl text-foreground sm:text-5xl">THREE STEPS, IN ORDER</h2>

          <div className="relative mt-20">
            <div
              className="absolute inset-x-0 top-[26px] hidden h-px bg-gradient-to-r from-arsenal-gold to-arsenal-gold/15 sm:block"
              aria-hidden="true"
            />
            <div className="relative grid gap-10 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.n} className={step.offset ? "flex flex-col items-start sm:mt-14" : "flex flex-col items-start"}>
                  <div
                    className={
                      step.tone === "red"
                        ? "mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-arsenal-red font-display text-xl text-white"
                        : "mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-arsenal-gold bg-arsenal-navy font-display text-xl text-white"
                    }
                  >
                    {step.n}
                  </div>
                  <h3 className="font-display text-xl tracking-wide text-foreground">{step.title.toUpperCase()}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard teaser */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-arsenal-navy-deep p-10 sm:p-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 select-none font-display text-[220px] leading-none text-transparent"
            style={{ WebkitTextStroke: "1.5px rgba(255,255,255,.06)" }}
          >
            28
          </span>
          <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rotate-45 bg-arsenal-gold" aria-hidden="true" />
                <span className="font-display text-xs tracking-[0.2em] text-arsenal-gold">SEASON LEADERBOARD</span>
              </div>
              <h2 className="mt-3 font-display text-3xl text-foreground">BANTER FUEL, NOT FANTASY FOOTBALL</h2>
              <p className="mt-2.5 max-w-[500px] text-sm leading-relaxed text-muted">
                Predict the scoreline, call the first scorer, and see where you land against every other Gunner who
                bothered to guess. Lightweight, for bragging rights only.
              </p>
            </div>
            <Link
              href="/login"
              className="flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
            >
              <TrophyIcon className="h-4 w-4" />
              Sign in to predict
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
        <div
          className="relative overflow-hidden rounded-2xl border border-surface-border p-16 text-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(219,0,7,.3), var(--arsenal-navy-deep) 55%), repeating-linear-gradient(-35deg, rgba(255,255,255,.03) 0 2px, transparent 2px 30px)",
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-evenly" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className="-mt-[7px] h-3.5 w-3.5 rounded-full bg-[#050f24]" />
            ))}
          </div>
          <h2 className="relative font-display text-4xl text-foreground sm:text-5xl">COME ON YOU GUNNERS</h2>
          <p className="relative mx-auto mt-2.5 max-w-md text-sm text-muted">
            Two minutes to a Fan Pass. A lifetime of bragging rights in the group.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href={WHATSAPP_GROUP_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] items-center gap-2 rounded-full bg-whatsapp-green px-7 text-[15px] font-bold text-arsenal-navy-deep transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <WhatsappLogoIcon weight="fill" className="h-5 w-5" />
              Join the WhatsApp Group
            </Link>
            <Link
              href="/register"
              className="flex h-[52px] items-center gap-2 rounded-full border border-white/30 px-7 text-[15px] font-bold text-foreground transition-colors hover:bg-white/5"
            >
              Get your Fan Pass
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
