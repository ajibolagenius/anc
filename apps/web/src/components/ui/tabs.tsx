import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Tabs({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-[22px] border-b border-surface-border", className)} role="tablist">
      {children}
    </div>
  );
}

export function TabLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={cn(
        "border-b-2 px-0.5 py-2.5 text-[13.5px] transition-colors",
        active ? "border-arsenal-red font-semibold text-foreground" : "border-transparent text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
