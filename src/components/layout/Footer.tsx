import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="container mx-auto flex flex-col gap-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-ink">Seminar Anwendungsethik</p>
          <p>Umwelt- und Tierethik im Dialog</p>
        </div>
        <div className="flex gap-4">
          <Link href="/diskussionsassistent" className="hover:text-ink">
            Diskussionsassistent
          </Link>
          <Link href="/feedback" className="hover:text-ink">
            Feedback
          </Link>
        </div>
      </div>
    </footer>
  );
}
