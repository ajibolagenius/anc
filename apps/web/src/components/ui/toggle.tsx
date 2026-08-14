import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ToggleProps = InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode };

export function Toggle({ label, className, ...props }: ToggleProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5", className)}>
      <span className="relative inline-flex h-5 w-[34px] flex-shrink-0 items-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10 transition-colors peer-checked:bg-arsenal-red" />
        <span className="pointer-events-none relative ml-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-[14px]" />
      </span>
      {label && <span className="text-[12.5px] text-foreground/90">{label}</span>}
    </label>
  );
}
