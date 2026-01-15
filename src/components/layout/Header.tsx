import Link from "next/link";
import { buttonStyles } from "@/src/components/ui/Button";
import ThemeToggle from "@/src/components/ui/ThemeToggle";

const navItems = [
  { label: "Begriffsklärung", href: "/begriffsklaerung" },
  { label: "Diskussionsassistent", href: "/diskussionsassistent" },
  { label: "Diskussionsforum", href: "/diskussionsforum" },
  { label: "Blog", href: "/blog" },
  { label: "Feedback", href: "/feedback" }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Ethik-Dialog
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink/80 transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/diskussion/erstellen"
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            Diskussion starten
          </Link>
        </div>
      </div>
      <div className="container mx-auto flex gap-3 overflow-x-auto pb-3 text-xs md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-none border border-border px-3 py-1 text-ink/70"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
