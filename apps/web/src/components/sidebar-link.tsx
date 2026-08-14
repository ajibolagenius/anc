"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Icon is a pre-rendered element (`<GiftIcon className="..." />`), not a
 * component reference — Server Components can pass rendered ReactNode props
 * into a Client Component, but never a raw function/component type across
 * that boundary (RSC can't serialize it). The wrapping span controls color
 * via currentColor so the active/inactive state still works without the
 * caller needing to know which state applies.
 */
export function SidebarLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active ? "bg-arsenal-red/15 text-foreground" : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
      }`}
    >
      <span className={`inline-flex shrink-0 ${active ? "text-arsenal-red-bright" : "text-muted"}`}>{icon}</span>
      {label}
    </Link>
  );
}
