import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "md" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner + `pendingLabel` (falling back to `children`) and disables the button. */
  pending?: boolean;
  pendingLabel?: ReactNode;
  fullWidth?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-arsenal-red text-white hover:bg-arsenal-red-bright",
  secondary: "border border-surface-border text-foreground hover:border-arsenal-gold",
  danger: "bg-arsenal-red-bright text-white hover:brightness-110",
  ghost: "text-muted hover:text-foreground",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "h-[46px] px-6 text-sm",
  sm: "h-[38px] px-4 text-xs",
};

export function Button({
  variant = "primary",
  size = "md",
  pending = false,
  pendingLabel,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isGhost = variant === "ghost";

  return (
    <button
      disabled={disabled || pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-bold font-body transition-colors disabled:cursor-not-allowed",
        !isGhost && SIZE_CLASSES[size],
        isGhost && "h-auto rounded-none bg-transparent px-0 font-semibold",
        VARIANT_CLASSES[variant],
        pending && "opacity-50",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {pending && <Spinner className={isGhost ? undefined : "border-white/40 border-t-white"} />}
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}
