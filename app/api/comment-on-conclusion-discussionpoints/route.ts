import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commentId = String(searchParams.get("commentId") ?? "").trim();
  const discussionPointConclusionId = String(searchParams.get("discussionPointConclusionId") ?? "").trim();

  const links = await prisma.commentOnConclusionDiscussionPoint.findMany({
    where: {
      ...(commentId ? { commentId } : null),
      ...(discussionPointConclusionId ? { discussionPointConclusionId } : null)
    }
  });

  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  const body = await request.json();
  const commentId = String(body.commentId ?? "").trim();
  const discussionPointConclusionId = String(body.discussionPointConclusionId ?? "").trim();

  if (!commentId || !discussionPointConclusionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const link = await prisma.commentOnConclusionDiscussionPoint.create({
    data: { commentId, discussionPointConclusionId }
  });

  return NextResponse.json({ link });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const commentId = String(body.commentId ?? "").trim();
  const discussionPointConclusionId = String(body.discussionPointConclusionId ?? "").trim();

  if (!commentId || !discussionPointConclusionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const link = await prisma.commentOnConclusionDiscussionPoint.upsert({
    where: {
      commentId_discussionPointConclusionId: {
        commentId,
        discussionPointConclusionId
      }
    },
    update: {},
    create: { commentId, discussionPointConclusionId }
  });

  return NextResponse.json({ link });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const commentId = String(body.commentId ?? "").trim();
  const discussionPointConclusionId = String(body.discussionPointConclusionId ?? "").trim();

  if (!commentId || !discussionPointConclusionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.commentOnConclusionDiscussionPoint.delete({
    where: {
      commentId_discussionPointConclusionId: {
        commentId,
        discussionPointConclusionId
      }
    }
  });

  return NextResponse.json({ ok: true });
}
