import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = Number(String(searchParams.get("code") ?? "").trim());
  const name = String(searchParams.get("name") ?? "").trim();
  const step = Number(searchParams.get("step"));

  if (!code || !name || !step) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({ where: { code } });
  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { name } });
  const participant = user
    ? await prisma.participant.findUnique({
        where: { userId_discussionId: { userId: user.id, discussionId: discussion.id } }
      })
    : null;

  if (!participant) {
    return NextResponse.json({ ready: false });
  }

  return NextResponse.json({
    ready: participant?.continueButton ?? false,
    updatedAt: null
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const code = Number(String(body.code ?? "").trim());
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

  let user = await prisma.user.findUnique({ where: { name } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let participant = await prisma.participant.findUnique({
    where: { userId_discussionId: { userId: user.id, discussionId: discussion.id } }
  });

  if (!participant) {
    participant = await prisma.participant.create({
      data: { userId: user.id, discussionId: discussion.id }
    });
  }

  if (discussion.step !== step && !participant.admin) {
    return NextResponse.json({ error: "Step locked" }, { status: 403 });
  }

  const status = await prisma.participant.update({
    where: { id: participant.id },
    data: { continueButton: ready }
  });

  return NextResponse.json({ ready: status.continueButton, updatedAt: null });
}
