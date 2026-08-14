import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "gold" | "green" | "red" | "blue" | "neutral";
export type BadgeSize = "sm" | "md";

const TONE_CLASSES: Record<BadgeTone, string> = {
  gold: "bg-arsenal-gold/[.18] text-arsenal-gold",
  green: "bg-whatsapp-green/[.15] text-whatsapp-green",
  red: "bg-arsenal-red-bright/[.15] text-arsenal-red-bright",
  blue: "bg-arsenal-navy/40 text-[#7FB0E8]",
  neutral: "bg-surface-2 text-muted",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  size?: BadgeSize;
};

export function Badge({ tone = "neutral", size = "md", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg font-bold uppercase tracking-wide",
        size === "md" ? "px-3 py-1 text-[11px]" : "rounded-md px-1.5 py-0.5 text-[10px]",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
