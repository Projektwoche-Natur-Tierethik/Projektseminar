import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { buttonStyles } from "@/src/components/ui/Button";
import { discussionSteps } from "@/src/config/discussion";

export const metadata = {
  title: "Diskussionsassistent",
  description: "Strukturierter Ablauf für ethische Diskussionen."
};

export default function AssistantPage() {
  return (
    <div className="container mx-auto space-y-12 pb-20 pt-12">
      <header className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold">Diskussionsassistent</h1>
          <p className="text-muted">
            Ein Schritt-für-Schritt-Guide, um Werte, Normen und konkrete
            Handlungsoptionen gemeinsam herauszuarbeiten.
          </p>
          <div className="flex gap-3">
            <Link
              href="/diskussion/erstellen"
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              Diskussion erstellen
            </Link>
            <Link
              href="/diskussion/join"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Diskussion beitreten
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tutorial</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            Platzhalter für einen Beispielablauf aus dem Seminar (Ergebnis,
            Regeln, Zeitvorgaben).
          </CardContent>
        </Card>
      </header>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {discussionSteps.map((step, index) => (
          <Card key={step.step}>
            <CardHeader>
              <CardTitle>
                Schritt {index + 1}: {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted">
              {step.prompt}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
