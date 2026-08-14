import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-arsenal-red selection:text-white">
      <MarketingHeader />

      <main className="relative flex flex-1 items-center justify-center px-6 py-24 sm:py-32">
        {/* Background ambient glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[450px] w-[600px] -translate-x-1/2 rounded-full bg-arsenal-red/10 blur-[120px]" />

        <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
          {/* Big Offside Number */}
          <span className="font-display text-8xl font-bold tracking-tight text-arsenal-red-bright/40 sm:text-9xl">
            404
          </span>

          <div className="-mt-4 inline-flex items-center gap-2 rounded-full border border-arsenal-gold/30 bg-arsenal-gold/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-arsenal-gold">
            FLAG IS UP · OFFSIDE
          </div>

          <h1 className="mt-5 font-display text-3xl tracking-wide text-foreground sm:text-4xl">
            YOU&apos;RE CAUGHT OFFSIDE, GUNNER
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted">
            The page you&apos;re looking for was either tackled away, transferred during the window, or never existed in the playbook.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="flex h-11 items-center gap-2 rounded-full bg-arsenal-red px-6 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-arsenal-red-bright"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to the Pitch</span>
            </Link>

            <Link
              href="/portal"
              className="flex h-11 items-center gap-2 rounded-full border border-surface-border bg-white/5 px-6 text-sm font-bold text-foreground transition-colors hover:border-arsenal-gold hover:bg-white/10"
            >
              <span>Member Portal</span>
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
