import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-white/[.08]", className)} {...props} />;
}

export function SkeletonLines({
  widths = ["70%", "100%", "85%"],
  className,
}: {
  widths?: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {widths.map((width, i) => (
        <Skeleton key={i} className="h-3.5" style={{ width }} />
      ))}
    </div>
  );
}
