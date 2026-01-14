import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = String(searchParams.get("code") ?? "").trim().toUpperCase();

  const discussion = await prisma.discussion.findUnique({
    where: { code },
    include: { valueSelections: true }
  });

  if (!discussion) {
    return NextResponse.json({ topValues: [] });
  }

  const counts = discussion.valueSelections.reduce((acc, item) => {
    acc[item.value] = (acc[item.value] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topValues = Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ topValues });
}

export async function POST(request: Request) {
  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const name = String(body.name ?? "").trim();
  const values = Array.isArray(body.values) ? body.values : [];

  const discussion = await prisma.discussion.findUnique({ where: { code } });

  if (!discussion || !name) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let participant = await prisma.participant.findUnique({
    where: { discussionId_name: { discussionId: discussion.id, name } }
  });

  if (!participant) {
    participant = await prisma.participant.create({
      data: { name, discussionId: discussion.id }
    });
  }

  if (discussion.currentStep < 1 && !participant.isHost) {
    return NextResponse.json({ error: "Not started" }, { status: 403 });
  }

  await prisma.valueSelection.deleteMany({
    where: { participantId: participant.id }
  });

  if (values.length > 0) {
    await prisma.valueSelection.createMany({
      data: values.map((value: string) => ({
        value,
        participantId: participant.id,
        discussionId: discussion.id
      }))
    });
  }

  return NextResponse.json({ ok: true });
}
