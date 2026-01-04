import type { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink",
        "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}
