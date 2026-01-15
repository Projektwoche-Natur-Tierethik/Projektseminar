import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commentId = String(searchParams.get("commentId") ?? "").trim();
  const participantId = String(searchParams.get("participantId") ?? "").trim();

  const links = await prisma.commentOnConclusionDiscussion.findMany({
    where: {
      ...(commentId ? { commentId } : null),
      ...(participantId ? { participantId } : null)
    }
  });

  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  const body = await request.json();
  const commentId = String(body.commentId ?? "").trim();
  const participantId = String(body.participantId ?? "").trim();

  if (!commentId || !participantId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const link = await prisma.commentOnConclusionDiscussion.create({
    data: { commentId, participantId }
  });

  return NextResponse.json({ link });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const commentId = String(body.commentId ?? "").trim();
  const participantId = String(body.participantId ?? "").trim();

  if (!commentId || !participantId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const link = await prisma.commentOnConclusionDiscussion.upsert({
    where: {
      commentId_participantId: {
        commentId,
        participantId
      }
    },
    update: {},
    create: { commentId, participantId }
  });

  return NextResponse.json({ link });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const commentId = String(body.commentId ?? "").trim();
  const participantId = String(body.participantId ?? "").trim();

  if (!commentId || !participantId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.commentOnConclusionDiscussion.delete({
    where: {
      commentId_participantId: {
        commentId,
        participantId
      }
    }
  });

  return NextResponse.json({ ok: true });
}
