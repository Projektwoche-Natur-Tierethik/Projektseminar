import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { prisma } from "@/src/lib/prisma";

export const metadata = {
  title: "Diskussionsforum",
  description: "Austausch für Seminarteilnehmer mit moderierten Themen."
};

export default async function ForumPage() {
  const discussions = await prisma.discussion.findMany({
    where: { step: { gte: 7 } },
    include: { discussionPoints: true },
    orderBy: { code: "desc" }
  });

  return (
    <div className="container mx-auto space-y-8 pb-6 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Diskussionsforum</h1>
        <p className="text-muted">
          Meinungsaustausch im Seminar mit strukturierten Themen.
        </p>
      </header>

      {discussions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {discussions.map((discussion) => {
            const completedCount = discussion.discussionPoints.filter(
              (point) => point.markedAsComplete
            ).length;
            return (
              <Card key={discussion.id}>
                <CardHeader className="space-y-2">
                  <Badge>Veröffentlicht</Badge>
                  <CardTitle>{discussion.discussionTheme}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted">
                  <p>Code: {discussion.code}</p>
                  <p>Diskussionspunkte: {discussion.discussionPoints.length}</p>
                  <p>Abgeschlossen: {completedCount}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-sm text-muted">
            Noch keine veröffentlichten Diskussionen.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
