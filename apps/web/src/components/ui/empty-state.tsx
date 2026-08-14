import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-surface-border bg-surface/40 p-6 text-center",
        className,
      )}
    >
      <div className="text-[13px] text-muted">{title}</div>
      {description && <div className="mt-1 text-[11.5px] text-muted/70">{description}</div>}
    </div>
  );
}
