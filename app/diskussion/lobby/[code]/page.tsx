import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import HostControls from "@/src/components/discussion/HostControls";
import CopyCodeButton from "@/src/components/discussion/CopyCodeButton";
import { buttonStyles } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

type LobbyPageProps = {
  params: { code: string };
  searchParams?: { name?: string };
};

export default async function LobbyPage({ params, searchParams }: LobbyPageProps) {
  const discussion = await prisma.discussion.findUnique({
    where: { code: params.code },
    include: { participants: true }
  });

  if (!discussion) {
    return (
      <div className="container mx-auto pt-12">
        <p>Diskussion nicht gefunden.</p>
      </div>
    );
  }

  const name = searchParams?.name ?? "";

  const currentStep = discussion.currentStep;
  const participant = discussion.participants.find((item) => item.name === name);
  const isHost = participant?.isHost ?? false;

  const stepStatuses =
    currentStep > 0 && currentStep <= 5
      ? await prisma.stepStatus.findMany({
          where: { discussionId: discussion.id, step: currentStep },
          select: { participantId: true, ready: true, updatedAt: true }
        })
      : [];

  const statusByParticipant = new Map(
    stepStatuses.map((status) => [status.participantId, status])
  );

  const visibleParticipants = discussion.participants.filter((item) => !item.isHost);
  const readyCount = visibleParticipants.reduce((count, item) => {
    const status = statusByParticipant.get(item.id);
    return status?.ready ? count + 1 : count;
  }, 0);

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Lobby</h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted">Diskussionscode: {discussion.code}</p>
          <CopyCodeButton code={discussion.code} />
        </div>
        <p className="text-sm text-muted">
          Aktueller Schritt:{" "}
          {currentStep === 0
            ? "Noch nicht gestartet"
            : currentStep > 5
              ? "Auswertung"
              : `Schritt ${currentStep}`}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Fragestellung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">{discussion.question}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teilnehmende</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          {discussion.participants.map((participant) => (
            <div key={participant.id}>{participant.name}</div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {currentStep >= 1 && currentStep <= 5 && (
          <Link
            href={`/diskussion/schritt/${currentStep}?code=${discussion.code}&name=${encodeURIComponent(
              name
            )}`}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Zum aktuellen Schritt
          </Link>
        )}
        {currentStep > 5 && (
          <Link
            href={`/diskussion/auswertung/${discussion.code}`}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Zur Auswertung
          </Link>
        )}
      </div>

      {isHost && (
        <Card>
          <CardHeader>
            <CardTitle>Leitung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted">
            <p>Hier kannst du die Schritte freigeben.</p>
            {currentStep > 0 && currentStep <= 5 && (
              <div className="space-y-2">
                <p className="text-ink">
                  Bereitschaft: {readyCount} / {visibleParticipants.length}
                </p>
                <div className="space-y-2">
                  {visibleParticipants.map((item) => {
                    const status = statusByParticipant.get(item.id);
                    const label = status?.ready ? "bereit" : "nicht bereit";
                    const timestamp = status?.updatedAt
                      ? new Date(status.updatedAt).toLocaleString("de-DE")
                      : null;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg px-3 py-2"
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-muted">
                          {label}
                          {timestamp ? ` · ${timestamp}` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <HostControls code={discussion.code} name={name} initialStep={currentStep} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
