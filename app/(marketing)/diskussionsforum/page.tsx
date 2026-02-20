import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";

export const metadata = {
  title: "Diskussionsforum",
  description: "Austausch für Seminarteilnehmer mit moderierten Themen."
};

const posts = [
  {
    title: "Zoos im Spannungsfeld von Artenschutz und Tierwohl",
    tag: "Debatte",
    excerpt: "Welche Mindestanforderungen braucht ein ethisch vertretbarer Zoo?"
  },
  {
    title: "Wildtiermanagement in Städten",
    tag: "Diskussion",
    excerpt: "Koexistenz von Mensch und Tier in urbanen Räumen."
  },
  {
    title: "Ethik in der Landwirtschaft",
    tag: "Positionspapier",
    excerpt: "Welche Pflichten ergeben sich aus dem Schutz von Lebewesen?"
  }
];

export default function ForumPage() {
  return (
    <div className="container mx-auto space-y-8 pb-6 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Diskussionsforum</h1>
        <p className="text-muted">
          Meinungsaustausch im Seminar mit strukturierten Themen.
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
