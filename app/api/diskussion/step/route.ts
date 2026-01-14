import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const name = String(body.name ?? "").trim();
  const step = Number(body.step);
  const response = String(body.response ?? "").trim();

  if (!code || !name || !step || !response) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({ where: { code } });

  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let participant = await prisma.participant.findUnique({
    where: { discussionId_name: { discussionId: discussion.id, name } }
  });

  if (!participant) {
    participant = await prisma.participant.create({
      data: { name, discussionId: discussion.id }
    });
  }

  if (discussion.currentStep < step && !participant.isHost) {
    return NextResponse.json({ error: "Step locked" }, { status: 403 });
  }

  await prisma.stepResponse.upsert({
    where: { participantId_step: { participantId: participant.id, step } },
    update: { response },
    create: {
      step,
      response,
      participantId: participant.id,
      discussionId: discussion.id
    }
  });

  return NextResponse.json({ ok: true });
}
