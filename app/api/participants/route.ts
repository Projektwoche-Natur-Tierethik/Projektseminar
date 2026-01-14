import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const participantId = String(searchParams.get("participantId") ?? "").trim();
  const discussionId = String(searchParams.get("discussionId") ?? "").trim();
  const userId = String(searchParams.get("userId") ?? "").trim();

  if (participantId) {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    });
    return NextResponse.json({ participant });
  }

  const participants = await prisma.participant.findMany({
    where: {
      ...(discussionId ? { discussionId } : null),
      ...(userId ? { userId } : null)
    }
  });

  return NextResponse.json({ participants });
}

export async function POST(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const userId = String(body.userId ?? "").trim();
  const admin = Boolean(body.admin);

  if (!discussionId || !userId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const participant = await prisma.participant.create({
    data: {
      discussionId,
      userId,
      admin
    }
  });

  return NextResponse.json({ participant });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const participantId = String(body.participantId ?? "").trim();

  if (!participantId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const participant = await prisma.participant.update({
    where: { id: participantId },
    data: {
      ...(typeof body.continueButton === "boolean"
        ? { continueButton: body.continueButton }
        : null),
      ...(typeof body.admin === "boolean" ? { admin: body.admin } : null),
      ...(body.mainConclusion ? { mainConclusion: String(body.mainConclusion).trim() } : null)
    }
  });

  return NextResponse.json({ participant });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const participantId = String(body.participantId ?? "").trim();

  if (!participantId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.participant.delete({ where: { id: participantId } });
  return NextResponse.json({ ok: true });
}
