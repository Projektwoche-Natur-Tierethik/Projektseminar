import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-accent text-white hover:bg-accent/90": variant === "primary",
      "border border-border bg-transparent text-ink hover:bg-surface":
        variant === "outline",
      "bg-transparent text-ink hover:bg-surface": variant === "ghost"
    },
    {
      "px-3 py-1.5 text-xs": size === "sm",
      "px-4 py-2 text-sm": size === "md",
      "px-6 py-3 text-base": size === "lg"
    },
    className
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles({ variant, size, className })} {...props} />
  );
}
