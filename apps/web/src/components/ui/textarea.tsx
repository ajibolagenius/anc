import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { inputClassName } from "@/components/form-field";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClassName, "min-h-[120px] py-3 leading-relaxed", className)} {...props} />;
}
