import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getValueLabel } from "@/src/lib/value-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

type ForumDetailPageProps = {
  params: { code: string };
};

export default async function ForumDetailPage({ params }: ForumDetailPageProps) {
  const code = Number(params.code);
  if (!code) notFound();

  const discussion = await prisma.discussion.findUnique({
    where: { code },
    include: {
      participants: { include: { user: true } },
      frameOfValues: true,
      norms: { include: { user: true } },
      discussionPoints: {
        include: {
          conclusions: { include: { user: true } }
        }
      }
    }
  });

  if (!discussion || discussion.step < 7) {
    notFound();
  }

  const werterahmen = discussion.frameOfValues
    .filter((item) => item.partOfFrame)
    .map((item) => getValueLabel(item.valueId))
    .filter((item): item is string => Boolean(item));
  const gruppenNormen = discussion.norms;
  const hauptfazits = discussion.participants.filter((item) => !item.admin && item.mainConclusion);
  const abgeschlossenePunkte = discussion.discussionPoints.filter((item) => item.markedAsComplete);

  return (
    <div className="container mx-auto space-y-8 pb-6 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Diskussionsfazit</h1>
        <p className="text-muted">{discussion.discussionTheme}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fazit der Diskussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              {hauptfazits.length > 0 ? (
                hauptfazits.map((participant) => (
                  <div
                    key={participant.id}
                    className="rounded-xl border border-border bg-bg px-3 py-2"
                  >
                    <p className="text-xs text-muted">{participant.user.name}</p>
                    <p className="whitespace-pre-wrap text-ink">{participant.mainConclusion}</p>
                  </div>
                ))
              ) : (
                <p>Noch keine Fazits der Teilnehmenden vorhanden.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fazit zu Diskussionspunkten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted">
              {abgeschlossenePunkte.length > 0 ? (
                abgeschlossenePunkte.map((punkt) => (
                  <div
                    key={punkt.id}
                    className="space-y-3 rounded-xl border border-border bg-bg p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-muted">Diskussionspunkt</p>
                      <p className="text-ink">{punkt.discussionPoint}</p>
                    </div>
                    <div className="space-y-2">
                      {punkt.conclusions.length > 0 ? (
                        punkt.conclusions.map((conclusion) => (
                          <div
                            key={conclusion.id}
                            className="rounded-lg border border-border bg-surface px-3 py-2"
                          >
                            <p className="text-ink">{conclusion.conclusion}</p>
                            <p className="text-xs text-muted">{conclusion.user.name}</p>
                          </div>
                        ))
                      ) : (
                        <p>Noch keine Fazits erfasst.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>Keine abgeschlossenen Diskussionspunkte vorhanden.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Werterahmen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted">
              {werterahmen.length > 0 ? (
                werterahmen.map((wert) => (
                  <div key={wert} className="rounded-xl border border-border bg-bg px-3 py-2">
                    <p className="text-ink">{wert}</p>
                  </div>
                ))
              ) : (
                <p>Kein Werterahmen hinterlegt.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Normen der Gruppe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              {gruppenNormen.length > 0 ? (
                gruppenNormen.map((norm) => (
                  <div key={norm.id} className="rounded-xl border border-border bg-bg px-3 py-2">
                    <p className="text-ink">{norm.norm}</p>
                    <p className="text-xs text-muted">
                      {norm.user.name} · Bezug: {getValueLabel(norm.basedOnValueId) ?? "Unbekannt"}
                    </p>
                  </div>
                ))
              ) : (
                <p>Keine Normen vorhanden.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
