import type { InputHTMLAttributes, ReactNode } from "react";
import { CheckIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode };

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-start gap-2.5", className)}>
      <span className="mt-0.5 grid h-[18px] w-[18px] flex-shrink-0 place-items-center">
        <input
          type="checkbox"
          className="peer col-start-1 row-start-1 h-[18px] w-[18px] cursor-pointer appearance-none rounded-[5px] border border-surface-border bg-transparent checked:border-arsenal-red checked:bg-arsenal-red"
          {...props}
        />
        <CheckIcon
          weight="bold"
          className="pointer-events-none col-start-1 row-start-1 h-3 w-3 scale-0 text-white transition-transform peer-checked:scale-100"
          aria-hidden="true"
        />
      </span>
      {label && <span className="text-sm text-foreground/90">{label}</span>}
    </label>
  );
}
