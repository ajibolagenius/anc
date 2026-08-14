import type { SelectHTMLAttributes } from "react";
import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import { inputClassName } from "@/components/form-field";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(inputClassName, "appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <CaretDownIcon
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </div>
  );
}
