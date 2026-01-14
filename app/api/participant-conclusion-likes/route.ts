import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const participantId = String(searchParams.get("participantId") ?? "").trim();

  if (!participantId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const count = await prisma.participantConclusionLike.count({
    where: { participantId }
  });

  return NextResponse.json({ count });
}

export async function POST(request: Request) {
  const body = await request.json();
  const likerUserId = String(body.likerUserId ?? "").trim();
  const participantId = String(body.participantId ?? "").trim();

  if (!likerUserId || !participantId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const like = await prisma.participantConclusionLike.create({
    data: { likerUserId, participantId }
  });

  return NextResponse.json({ like });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const likerUserId = String(body.likerUserId ?? "").trim();
  const participantId = String(body.participantId ?? "").trim();

  if (!likerUserId || !participantId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.participantConclusionLike.delete({
    where: { likerUserId_participantId: { likerUserId, participantId } }
  });

  return NextResponse.json({ ok: true });
}
