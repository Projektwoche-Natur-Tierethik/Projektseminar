import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
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

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Lobby</h1>
        <p className="text-muted">Diskussionscode: {discussion.code}</p>
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
        <Link
          href={`/diskussion/schritt/1?code=${discussion.code}&name=${encodeURIComponent(
            name
          )}`}
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          Diskussion starten
        </Link>
        <Link
          href="/diskussion/join"
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          Weitere Teilnehmende einladen
        </Link>
      </div>
    </div>
  );
}
