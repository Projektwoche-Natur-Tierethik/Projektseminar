import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import HostControls from "@/src/components/discussion/HostControls";
import CopyCodeButton from "@/src/components/discussion/CopyCodeButton";
import CopyJoinLinkButton from "@/src/components/discussion/CopyJoinLinkButton";
import JoinQrCode from "@/src/components/discussion/JoinQrCode";
import LobbyAutoRedirect from "@/src/components/discussion/LobbyAutoRedirect";
import LobbyParticipantsCard from "@/src/components/discussion/LobbyParticipantsCard";
import { buttonStyles } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { normalizeDiscussionSettings } from "@/src/lib/discussion-settings";

type LobbyPageProps = {
  params: { code: string };
  searchParams?: { name?: string };
};

export const dynamic = "force-dynamic";

export default async function LobbyPage({ params, searchParams }: LobbyPageProps) {
  const code = Number(params.code);
  const discussion = await prisma.discussion.findUnique({
    where: { code },
    include: { participants: { include: { user: true } } }
  });

  if (!discussion) {
    return (
      <div className="container mx-auto pt-12">
        <p>Diskussion nicht gefunden.</p>
      </div>
    );
  }

  const name = searchParams?.name ?? "";
  const codeText = String(discussion.code);
  const shouldAutoRedirect = Boolean(name);
  const settings = normalizeDiscussionSettings({
    normsPartOf: discussion.normsPartOf,
    inclusionProblemPartOf: discussion.inclusionProblemPartOf,
    valuesSelectionCount: discussion.valuesSelectionCount,
    questionsPerParticipant: discussion.questionsPerParticipant
  });

  const currentStep = discussion.step;
  const participant = discussion.participants.find((item) => item.user.name === name);
  const isHost = participant?.admin ?? false;

  const visibleParticipants = discussion.participants.filter((item) => !item.admin);
  const readyCount = visibleParticipants.reduce((count, item) => {
    return item.continueButton ? count + 1 : count;
  }, 0);

  return (
    <div className="container mx-auto space-y-8 pb-6 pt-12">
      {shouldAutoRedirect && <LobbyAutoRedirect code={code} name={name} />}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Lobby</h1>
        <p className="text-muted">
          Teile den Code, den Einladungslink oder den QR-Code für den Beitritt.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Diskussionscode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xl font-semibold text-ink">{discussion.code}</p>
            <CopyCodeButton code={codeText} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Einladungslink</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted">
              Direkt zum Beitreten ohne Codeeingabe.
            </p>
            <CopyJoinLinkButton code={codeText} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR-Code</CardTitle>
          </CardHeader>
          <CardContent>
            <JoinQrCode code={codeText} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fragestellung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">{discussion.discussionTheme}</p>
        </CardContent>
      </Card>

      <LobbyParticipantsCard
        discussionId={discussion.id}
        initialParticipants={discussion.participants}
        isHost={isHost}
      />

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
            href={`/diskussion/schritt/5?code=${discussion.code}&name=${encodeURIComponent(
              name
            )}`}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Zum Fazit
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
                    const label = item.continueButton ? "bereit" : "nicht bereit";
                    return (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg px-3 py-2"
                      >
                        <span>{item.user.name}</span>
                        <span className="text-xs text-muted">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <HostControls
              code={codeText}
              name={name}
              initialStep={currentStep}
              settings={settings}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
