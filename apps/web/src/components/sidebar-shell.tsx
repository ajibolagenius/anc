"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "@/components/icons";

/**
 * Turns a fixed-width sidebar into a slide-in drawer below the md breakpoint
 * — without this, the sidebar and main content just squeeze side-by-side on
 * a phone screen, leaving both unusably narrow.
 */
export function SidebarShell({ logo, children }: { logo: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever navigation happens — the layout persists
  // across route changes in the App Router, so without this the drawer
  // would stay open after tapping a link.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-4 md:hidden">
        {logo}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-white/5"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col justify-between border-r border-surface-border bg-background px-5 py-6 transition-transform duration-300 md:static md:z-auto md:w-60 md:translate-x-0 md:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-foreground md:hidden"
        >
          <XIcon className="h-5 w-5" />
        </button>
        {children}
      </aside>
    </>
  );
}
