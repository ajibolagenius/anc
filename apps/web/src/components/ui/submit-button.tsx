"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./button";

/**
 * Drop-in replacement for a plain `<button type="submit">` inside a
 * `<form action={serverAction}>` — automatically shows the pending
 * spinner/disabled state via `useFormStatus`, without the parent form
 * needing `useActionState`. Matches the existing throw-on-error Server
 * Action convention used across admin/portal CRUD forms.
 */
export function SubmitButton({ children, pendingLabel, ...props }: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" pending={pending} pendingLabel={pendingLabel} {...props}>
      {children}
    </Button>
  );
}
