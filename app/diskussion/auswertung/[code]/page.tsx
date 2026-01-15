import { prisma } from "@/src/lib/prisma";
import { getValueLabel } from "@/src/lib/value-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

type ResultPageProps = {
  params: { code: string };
};

export default async function ResultPage({ params }: ResultPageProps) {
  const code = Number(params.code);
  const discussion = await prisma.discussion.findUnique({
    where: { code },
    include: {
      userValues: true,
      discussionPoints: { include: { writtenBy: true } }
    }
  });

  if (!discussion) {
    return (
      <div className="container mx-auto pt-12">
        <p>Diskussion nicht gefunden.</p>
      </div>
    );
  }

  const counts = discussion.userValues.reduce((acc, item) => {
    const label = getValueLabel(item.valueId) ?? "Unbekannt";
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topValues = Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const questions = discussion.discussionPoints;

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Auswertung</h1>
        <p className="text-muted">Diskussionscode: {discussion.code}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Top Werte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          {topValues.length > 0 ? (
            topValues.map((item) => (
              <div key={item.value} className="flex justify-between">
                <span>{item.value}</span>
                <span>{item.count}</span>
              </div>
            ))
          ) : (
            <p>Keine Werte erfasst.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diskussionsfragen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          {questions.length > 0 ? (
            questions.map((question) => (
              <div key={question.id} className="space-y-1">
                <p className="text-ink">{question.discussionPoint}</p>
                <p className="text-xs text-muted">
                  {question.writtenBy?.name ?? "Unbekannt"}
                </p>
              </div>
            ))
          ) : (
            <p>Keine Fragen erfasst.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
