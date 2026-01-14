import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { buttonStyles } from "@/src/components/ui/Button";

export const metadata = {
  title: "Ethik-Dialog | Start",
  description:
    "Plattform für Umwelt- und Tierethik mit Diskussionsassistent und Ressourcen."
};

const highlights = [
  {
    title: "Begriffsklärung",
    text: "Schnell nachschlagen, wenn zentrale ethische Begriffe in der Diskussion auftauchen."
  },
  {
    title: "Diskussionsassistent",
    text: "Strukturierter Ablauf in bis zu 5 Schritten: Werte, Normen, Inklusion, Umsetzung, Feedback."
  },
  {
    title: "Diskussionsforum",
    text: "Austausch im Seminarumfeld mit klaren Regeln und moderierter Struktur."
  }
];

export default function HomePage() {
  return (
    <div className="container mx-auto space-y-16 pb-20 pt-14">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Seminar Anwendungsethik
          </p>
          <h1 className="text-4xl font-semibold text-ink md:text-5xl">
            Diskursraum für Umwelt- und Tierethik
          </h1>
          <p className="text-lg text-muted">
            Eine Plattform, die universitäre Diskussionen strukturiert,
            Wissensbasis bereitstellt und Ethik im Dialog erlebbar macht.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/diskussionsassistent"
              className={buttonStyles({ variant: "primary", size: "lg" })}
            >
              Diskussionsassistent entdecken
            </Link>
            <Link
              href="/begriffsklaerung"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              Begriffsklärung
            </Link>
          </div>
        </div>
        <Card className="border-0 bg-surface/90 shadow-soft">
          <CardHeader>
            <CardTitle>Aktuelle Fokusfrage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted">
            <p>
              Wie können Tierhaltung und Umweltschutz im universitären Kontext
              verantwortungsvoll gestaltet werden?
            </p>
            <div className="rounded-xl border border-border bg-bg px-4 py-3 text-ink">
              Hinweis: Inhalte hier durch Seminartexte ersetzen.
            </div>
            <Link
              href="/diskussion/erstellen"
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              Diskussion erstellen
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
