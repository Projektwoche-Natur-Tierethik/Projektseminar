import Link from "next/link";
import { buttonStyles } from "@/src/components/ui/Button";

const navItems = [
  { label: "Begriffsklaerung", href: "/begriffsklaerung" },
  { label: "Diskussionsassistent", href: "/diskussionsassistent" },
  { label: "Diskussionsforum", href: "/diskussionsforum" },
  { label: "Blog", href: "/blog" },
  { label: "Feedback", href: "/feedback" }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between py-4">
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
        <Link
          href="/diskussion/erstellen"
          className={buttonStyles({ variant: "primary", size: "sm" })}
        >
          Diskussion starten
        </Link>
      </div>
      <div className="container mx-auto flex gap-3 overflow-x-auto pb-3 text-xs md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-ink/70"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
