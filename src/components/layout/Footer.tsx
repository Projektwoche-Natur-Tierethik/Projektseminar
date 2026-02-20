import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/90 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between text-sm text-muted">
        <p className="font-medium text-ink">v.Beta.0.1</p>
        <Link href="/ueber-uns" className="hover:text-ink">
          Über uns
        </Link>
      </div>
    </footer>
  );
}
