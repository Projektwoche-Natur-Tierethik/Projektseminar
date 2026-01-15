import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="container mx-auto flex flex-col gap-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="font-medium text-ink">v.Beta.0.1</p>
        <Link href="/ueber-uns" className="hover:text-ink">
          Über uns
        </Link>
      </div>
    </footer>
  );
}
