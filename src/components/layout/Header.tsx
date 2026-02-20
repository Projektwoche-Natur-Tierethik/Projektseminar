"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonStyles } from "@/src/components/ui/Button";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import { navItems } from "@/src/components/layout/navItems";
import { cn } from "@/src/lib/utils";

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Ethik-Dialog
        </Link>
        <nav className="hidden h-full items-stretch text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-full items-center px-3 text-ink/80 transition hover:bg-surface hover:text-ink",
                isActive(item.href) && "bg-accent text-white hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/diskussion/join"
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            Diskussion beitreten
          </Link>
        </div>
      </div>
      <div className="header-subnav container mx-auto flex gap-3 overflow-x-auto pb-3 text-xs md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-none border border-border px-3 py-1 text-ink/70",
              isActive(item.href) && "border-accent bg-accent text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
