import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Gold border — marks a "needs attention" card (pending queue, open giveaway, etc). */
  highlight?: boolean;
};

export function Card({ highlight = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface/40 p-5",
        highlight ? "border-arsenal-gold" : "border-surface-border",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  highlight = false,
  className,
}: {
  label: string;
  /** A big numeral, or a short text value (e.g. "Tunde B. · 2 days"). */
  value: ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <Card highlight={highlight} className={cn("w-full", className)}>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={cn("mt-1.5 font-display text-3xl", highlight && "text-arsenal-gold")}>{value}</div>
    </Card>
  );
}
