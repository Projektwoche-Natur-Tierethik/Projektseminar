"use client";

import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

const sections = [
  { id: "ethik-moral", label: "Ethik und Moral" },
  { id: "werte-normen-pflichten", label: "Werte, Normen und Pflichten" },
  { id: "inklusion", label: "Inklusionsproblem" },
  { id: "umwelt-tierethik", label: "Umwelt- & Tierethik" }
];

const conceptCards = [
  {
    title: "Werte",
    badge: "Orientierung",
    definition:
      "Relativ abstrakte, über Situationen hinweg stabile Leitziele oder Prinzipien. Sie geben Orientierung, was als wertschätzenswert oder gut gilt. [1]",
    trait: "Merkmal: Bewertungsmaßstab, nicht direkt eine Handlungsregel."
  },
  {
    title: "Normen",
    badge: "Erwartungen",
    definition:
      "Informelle oder formelle Regeln und Erwartungen in einer Gruppe, die festlegen, welches Verhalten als angemessen gilt und durch soziale Rückmeldung stabilisiert wird. [2]",
    trait: "Merkmal: konkreter und kontextgebundener als Werte."
  },
  {
    title: "Pflichten",
    badge: "Verbindlichkeit",
    definition:
      "Ein deontischer Status: Etwas ist moralisch geboten, verboten oder erlaubt. Deontologische Ethik analysiert genau diese Kategorien. [3]",
    trait:
      "Merkmal: Pflichten sind typischerweise die bindendsten Normen und können triviale Gegen-Gründe ausschließen."
  }
];

const wnpSources = [
  {
    id: "1",
    label:
      "Czupryna, M., Growiec, K., Kaminski, B., & Oleksy, P. (2024). Schwartz Human Values and the Economic Performance. JASS, 27(1), 2.",
    href: "https://doi.org/10.18564/jasss.5023"
  },
  {
    id: "2",
    label:
      "UNICEF (2021). Defining Social Norms and Related Concepts (Nov 2021).",
    href:
      "https://www.unicef.org/media/98221/file/Defining-Social-Norms-and-Related-Concepts-2021.pdf"
  },
  {
    id: "3",
    label:
      "Alexander, L., & Moore, M. (2025). Deontological Ethics. Stanford Encyclopedia of Philosophy (Winter 2025).",
    href:
      "https://plato.stanford.edu/archives/win2025/entries/ethics-deontological/"
  }
];

export default function BegriffsklaerungContent() {
  const defaultId = "werte-normen-pflichten";
  const [activeId, setActiveId] = useState(defaultId);
  const sectionIndex = useMemo(
    () => sections.findIndex((section) => section.id === activeId),
    [activeId]
  );
  const prevSection = sections[sectionIndex - 1];
  const nextSection = sections[sectionIndex + 1];

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setActiveId(hash);
    }

    const handleHashChange = () => {
      const nextHash = window.location.hash.replace("#", "");
      setActiveId(nextHash || defaultId);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Begriffsklärung</h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-2 rounded-2xl border border-border bg-surface px-4 py-5 text-sm lg:sticky lg:top-24 lg:h-fit lg:border-r lg:pr-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Inhaltsverzeichnis
          </p>
          <nav className="space-y-2">
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block rounded-xl px-3 py-2 text-ink/80 transition hover:bg-bg hover:text-ink ${
                  activeId === item.id ? "bg-bg text-ink" : ""
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-10 lg:pl-6">
          {activeId === "ethik-moral" && (
            <section id="ethik-moral" className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-ink">Ethik und Moral</h2>
                <p className="text-sm text-muted">
                  Ethik reflektiert und begründet Normen, Moral beschreibt gelebte
                  Wert- und Verhaltensordnungen in einer Gemeinschaft.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Begriffsgeschichte</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted">
                Synonymer Sprachgebrauch der Begriffe <br />
»Ethik« (gr. ethos, ethike → Sitte) und <br />
»Moral« (lat. mos, moris → Gewohnheit, Sitte, [Wille, Gesetz])
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>(Aktuell) Philosophische Differenzierung(-smöglichkeit)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted">
                  Abgrenzung von Ethik: „Wissenschaft“, welche die Regeln, Prinzipien menschlichen Handelns bestimmt und begründet <br />
                   und Moral: Gesamtheit dieser Regeln, konkreter normativer Regelkanon
                </CardContent>
              </Card>
            </section>
          )}

          {activeId === "werte-normen-pflichten" && (
            <section id="werte-normen-pflichten" className="space-y-4">
              <h2 className="text-2xl font-semibold text-ink">
                Werte, Normen und Pflichten
              </h2>
              <div className="grid gap-6 xl:grid-cols-3">
                {conceptCards.map((concept) => (
                  <Card key={concept.title}>
                    <CardHeader className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {concept.badge}
                      </p>
                      <CardTitle>{concept.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted">{concept.definition}</p>
                      <p className="text-sm text-ink">{concept.trait}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Beispiel Ableitungskette</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-muted md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-bg px-4 py-3 text-ink">
                    Wert: Selbstständigkeit
                  </div>
                  <div className="rounded-xl border border-border bg-bg px-4 py-3 text-ink">
                    Norm: Man soll selbstbestimmt handeln und Entscheidungen eigenständig treffen
                  </div>
                  <div className="rounded-xl border border-border bg-bg px-4 py-3 text-ink">
                    Pflicht: Man muss die Entscheidungsfreiheit und Selbstbestimmtheit anderer respektieren (z. B. niemanden zwingen, schaden oder manipulieren)
                  </div>
                </CardContent>
              </Card>
              <details className="text-sm text-muted">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                  Quellen
                </summary>
                <div className="mt-3 space-y-2">
                  {wnpSources.map((source) => (
                    <a
                      key={source.id}
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-ink underline-offset-4 hover:underline"
                    >
                      [{source.id}] {source.label}
                    </a>
                  ))}
                </div>
              </details>
            </section>
          )}

          {activeId === "inklusion" && (
            <section id="inklusion" className="space-y-4">
              <h2 className="text-2xl font-semibold text-ink">Inklusionsproblem</h2>
            <Card>
              <CardHeader>
                <CardTitle>Platzhalter</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                Hier folgt die inhaltliche Ausarbeitung: Wer oder was soll durch
                die Normen geschuetzt werden? Hinweise, Beispiele und Quellen
                werden ergaenzt.
              </CardContent>
            </Card>
          </section>
          )}

          {activeId === "umwelt-tierethik" && (
            <section id="umwelt-tierethik" className="space-y-4">
              <h2 className="text-2xl font-semibold text-ink">
                Umwelt- & Tierethik
              </h2>
            <Card>
              <CardHeader>
                <CardTitle>Platzhalter</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                Hier folgt der Text zur Abgrenzung, zu Leitfragen und
                Diskussionslinien. Quellen und Beispiele werden spaeter
                eingepflegt.
              </CardContent>
            </Card>
          </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {prevSection ? (
              <a
                href={`#${prevSection.id}`}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                Zurueck: {prevSection.label}
              </a>
            ) : (
              <span />
            )}
            {nextSection ? (
              <a
                href={`#${nextSection.id}`}
                className={buttonStyles({ variant: "primary", size: "sm" })}
              >
                Weiter: {nextSection.label}
              </a>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
