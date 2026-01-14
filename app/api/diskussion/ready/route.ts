import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = String(searchParams.get("code") ?? "").trim().toUpperCase();
  const name = String(searchParams.get("name") ?? "").trim();
  const step = Number(searchParams.get("step"));

  if (!code || !name || !step) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({ where: { code } });
  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participant = await prisma.participant.findUnique({
    where: { discussionId_name: { discussionId: discussion.id, name } }
  });

  if (!participant) {
    return NextResponse.json({ ready: false });
  }

  const status = await prisma.stepStatus.findUnique({
    where: { participantId_step: { participantId: participant.id, step } }
  });

  return NextResponse.json({
    ready: status?.ready ?? false,
    updatedAt: status?.updatedAt ?? null
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const name = String(body.name ?? "").trim();
  const step = Number(body.step);
  const ready = Boolean(body.ready);

  if (!code || !name || !step) {
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

  if (discussion.currentStep !== step && !participant.isHost) {
    return NextResponse.json({ error: "Step locked" }, { status: 403 });
  }

  const status = await prisma.stepStatus.upsert({
    where: { participantId_step: { participantId: participant.id, step } },
    update: { ready },
    create: {
      step,
      ready,
      participantId: participant.id,
      discussionId: discussion.id
    }
  });

  return NextResponse.json({ ready: status.ready, updatedAt: status.updatedAt });
}
