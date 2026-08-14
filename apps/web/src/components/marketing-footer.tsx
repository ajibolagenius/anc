import Link from "next/link";
import { SparkleIcon } from "@phosphor-icons/react/ssr";
import { SITE, WHATSAPP_GROUP_INVITE_URL } from "@/lib/site-config";

export function MarketingFooter() {
  return (
    <footer className="border-t-2 border-arsenal-gold">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <SparkleIcon className="h-4 w-4 text-arsenal-gold" />
              <span className="font-display text-2xl tracking-wide text-foreground">{SITE.shortName}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              A Nigerian home for Arsenal fans — banter, giveaways, matchday culture, and a WhatsApp group at the
              center of it all.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Community</p>
            <div className="mt-3.5 flex flex-col gap-2.5 text-[13.5px]">
              <a
                href={WHATSAPP_GROUP_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/90 hover:text-foreground"
              >
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
            <div className="mt-3.5 flex flex-col gap-2.5 text-[13.5px]">
              <Link href="/privacy" className="text-foreground/90 hover:text-foreground">
                Privacy notice
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-surface-border pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Arsenal Nigeria Community. Fan-run, not affiliated with Arsenal FC.</span>
          <a href="https://ajibolagenius.vercel.app" target="_blank" rel="noreferrer" className="hover:text-foreground">
            Built with love by Ajibola Don_Genius
          </a>
        </div>
      </div>
    </footer>
  );
}
