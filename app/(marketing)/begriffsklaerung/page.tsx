import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

export const metadata = {
  title: "Begriffsklaerung",
  description: "Glossar und Einordnung zentraler Begriffe der Ethik."
};

const topics = [
  {
    title: "Einfuehrung Angewandte Ethik",
    text: "Platzhalter fuer eine Einordnung von Umwelt- und Tierethik."
  },
  {
    title: "Umwelt- vs. Tierethik",
    text: "Hier die Unterschiede, Schnittmengen und Leitfragen beschreiben."
  },
  {
    title: "Ethische Grundbegriffe",
    text:
      "Begriffe wie Verantwortung, Wuerde, Gerechtigkeit und Autonomie erklaeren."
  },
  {
    title: "Material von Prof. Wernecke",
    text: "Linkliste oder Auszuege aus dem Seminar-Material."
  }
];

export default function BegriffsPage() {
  return (
    <div className="container mx-auto space-y-10 pb-20 pt-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Begriffsklaerung</h1>
        <p className="text-muted">
          Schnell nachschlagen, wenn Begriffe in der Diskussion auftauchen.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {topics.map((topic) => (
          <Card key={topic.title}>
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{topic.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
