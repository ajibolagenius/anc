import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-3.5 w-3.5 animate-anc-spin rounded-full border-2 border-white/30 border-t-white",
        className,
      )}
    />
  );
}
