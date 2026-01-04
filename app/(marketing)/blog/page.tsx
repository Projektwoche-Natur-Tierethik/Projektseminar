import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";

export const metadata = {
  title: "Blog",
  description: "Ergebnisse, Events und Ressourcen aus dem Seminar."
};

const posts = [
  {
    title: "Exkursion: Nachhaltige Tierhaltung vor Ort",
    tag: "Event",
    excerpt: "Platzhalter fuer Ankuendigung und Ergebnisse."
  },
  {
    title: "Positivbeispiele fuer Mensch-Tier-Beziehungen",
    tag: "Best Practice",
    excerpt: "Inspirierende Projekte und Initiativen aus Forschung und Praxis."
  },
  {
    title: "Leseliste: Umweltethik kompakt",
    tag: "Ressourcen",
    excerpt: "Kuratiertes Material fuer die Vorbereitung der Diskussionen."
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-muted">
          Ergebnisse aus Seminaren, anstehende Events und Ressourcen.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.title}>
            <CardHeader className="space-y-2">
              <Badge>{post.tag}</Badge>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
