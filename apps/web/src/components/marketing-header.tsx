import Link from "next/link";

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#how-it-works", label: "How it works" },
];

/**
 * Sticky blurred header shared by every public route (landing, register,
 * privacy, login, admin-login) — design-spec.md §5.1. The `#platform`/
 * `#how-it-works` anchor links only resolve on `/`; elsewhere they still
 * navigate there first (browsers resolve `#hash` links relative to the
 * current page, so linking to `/#platform` from another route works too).
 */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-background/75 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-arsenal-red font-display text-sm text-white">
            AN
          </span>
          <span className="font-display text-lg tracking-[0.04em] text-foreground">ARSENAL NIGERIA COMMUNITY</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={`/${link.href}`} className="text-sm text-muted transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="text-sm text-muted transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex h-10 items-center rounded-full bg-arsenal-red px-5 text-[13px] font-bold text-white transition-colors hover:bg-arsenal-red-bright"
          >
            Get Fan Pass
          </Link>
        </nav>
        <Link
          href="/register"
          className="flex h-10 items-center rounded-full bg-arsenal-red px-5 text-[13px] font-bold text-white md:hidden"
        >
          Get Fan Pass
        </Link>
      </div>
    </header>
  );
}
