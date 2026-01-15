import type { HTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Tabs({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} {...props} />
  );
}

export function Tab({
  active,
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-none border border-border px-3 py-1 text-xs transition",
        active ? "bg-accent text-white" : "bg-surface text-muted",
        className
      )}
      {...props}
    />
  );
}
