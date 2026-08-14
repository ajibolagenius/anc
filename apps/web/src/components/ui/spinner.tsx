import { cn } from "@/lib/cn";

export function Spinner({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-7 w-7 border-[3px]",
  };

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-anc-spin rounded-full border-white/30 border-t-white",
        sizeClasses[size],
        className,
      )}
    />
  );
}
