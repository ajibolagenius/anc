import Link from "next/link";
import { cn } from "@/lib/cn";

export function Pagination({
  currentPage,
  totalPages,
  makeHref,
}: {
  currentPage: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center gap-1.5" aria-label="Pagination">
      {pages.map((page) => (
        <Link
          key={page}
          href={makeHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
            page === currentPage
              ? "bg-arsenal-red text-white"
              : "border border-surface-border text-muted hover:border-arsenal-gold hover:text-foreground",
          )}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
