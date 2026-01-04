import { prisma } from "@/src/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

type ResultPageProps = {
  params: { code: string };
};

export default async function ResultPage({ params }: ResultPageProps) {
  const discussion = await prisma.discussion.findUnique({
    where: { code: params.code },
    include: {
      valueSelections: true,
      stepResponses: { include: { participant: true } }
    }
  });

  if (!discussion) {
    return (
      <div className="container mx-auto pt-12">
        <p>Diskussion nicht gefunden.</p>
      </div>
    );
  }

  const counts = discussion.valueSelections.reduce((acc, item) => {
    acc[item.value] = (acc[item.value] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topValues = Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const responsesByStep = discussion.stepResponses.reduce((acc, response) => {
    const key = response.step;
    if (!acc[key]) acc[key] = [];
    acc[key].push(response);
    return acc;
  }, {} as Record<number, typeof discussion.stepResponses>);

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

      {Object.entries(responsesByStep).map(([step, responses]) => (
        <Card key={step}>
          <CardHeader>
            <CardTitle>Schritt {step}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            {responses.map((response) => (
              <div key={response.id}>
                <p className="font-medium text-ink">
                  {response.participant.name}
                </p>
                <p>{response.response}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
