import { prisma } from "@/src/lib/prisma";
import { getValueLabel } from "@/src/lib/value-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

type WertePageProps = {
  params: { code: string };
  searchParams?: { name?: string };
};

export default async function WertePage({ params, searchParams }: WertePageProps) {
  const code = Number(params.code);
  const name = searchParams?.name ?? "";

  const discussion = await prisma.discussion.findUnique({
    where: { code },
    include: {
      userValues: true,
      participants: true
    }
  });

  if (!discussion) {
    return (
      <div className="container mx-auto pt-12">
        <p>Diskussion nicht gefunden.</p>
      </div>
    );
  }

  let isHost = false;
  let selectedValueIds: string[] = [];
  if (name) {
    const user = await prisma.user.findUnique({ where: { name } });
    if (user) {
      const participant = discussion.participants.find((item) => item.userId === user.id);
      isHost = participant?.admin ?? false;
      selectedValueIds = discussion.userValues
        .filter((item) => item.userId === user.id)
        .map((item) => item.valueId);
    }
  }

  const selectedValueLabels = new Set(
    discussion.userValues
      .filter((item) => selectedValueIds.includes(item.valueId))
      .map((item) => item.value?.value ?? "Unbekannt")
  );
  const counts = discussion.userValues.reduce((acc, item) => {
    const label = getValueLabel(item.valueId) ?? "Unbekannt";
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topValues = Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = topValues[0]?.count ?? 1;

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Werte-Ranking</h1>
        <p className="text-muted">Diskussionscode: {discussion.code}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ranking Diagramm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topValues.length > 0 ? (
            topValues.map((item) => {
              const isSelected = selectedValueLabels.has(item.value);
              return (
                <div key={item.value} className="space-y-2">
                  <div
                    className={`flex items-center justify-between text-sm ${
                      isSelected ? "text-ink" : "text-muted"
                    }`}
                  >
                    <span>{item.value}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-none bg-border">
                    <div
                      className={`h-2 rounded-none ${isSelected ? "bg-primary" : "bg-ink/40"}`}
                      style={{ width: `${Math.max((item.count / maxCount) * 100, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted">Keine Werte erfasst.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
