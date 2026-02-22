import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { prisma } from "@/src/lib/prisma";

export const metadata = {
  title: "Diskussionsforum",
  description: "Veröffentlichte Diskussionen mit Fazits und abgeschlossenen Diskussionspunkten."
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
          Veröffentlichtes Ergebnisarchiv der Diskussionen mit Fazits und Diskussionspunkten.
        </p>
      </header>

      {discussions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {discussions.map((discussion) => {
            const completedPoints = discussion.discussionPoints.filter((point) => point.markedAsComplete);
            const previewPoints = completedPoints.slice(0, 3);
            return (
              <Link
                key={discussion.id}
                href={`/diskussionsforum/${discussion.code}`}
                className="block"
              >
                <Card className="h-full transition hover:border-ink/40">
                  <CardHeader className="space-y-2">
                    <Badge>Veröffentlicht</Badge>
                    <CardTitle>{discussion.discussionTheme}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted">
                    {previewPoints.length > 0 ? (
                      <>
                        <p className="text-xs uppercase tracking-[0.2em]">Abgeschlossene Diskussionspunkte</p>
                        <div className="space-y-2">
                          {previewPoints.map((point) => (
                            <div
                              key={point.id}
                              className="rounded-xl border border-border bg-bg px-3 py-2"
                            >
                              <p className="text-ink">{point.discussionPoint}</p>
                            </div>
                          ))}
                        </div>
                        {completedPoints.length > 3 && (
                          <p className="text-xs text-muted">
                            + {completedPoints.length - 3} weitere Punkte anzeigen
                          </p>
                        )}
                      </>
                    ) : (
                      <p>Noch keine abgeschlossenen Diskussionspunkte.</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
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
