import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commentedOnId = String(searchParams.get("commentedOnId") ?? "").trim();
  const newCommentId = String(searchParams.get("newCommentId") ?? "").trim();

  const links = await prisma.commentOnComment.findMany({
    where: {
      ...(commentedOnId ? { commentedOnId } : null),
      ...(newCommentId ? { newCommentId } : null)
    }
  });

  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  const body = await request.json();
  const commentedOnId = String(body.commentedOnId ?? "").trim();
  const newCommentId = String(body.newCommentId ?? "").trim();

  if (!commentedOnId || !newCommentId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const link = await prisma.commentOnComment.create({
    data: { commentedOnId, newCommentId }
  });

  return NextResponse.json({ link });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const commentedOnId = String(body.commentedOnId ?? "").trim();
  const newCommentId = String(body.newCommentId ?? "").trim();

  if (!commentedOnId || !newCommentId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const link = await prisma.commentOnComment.upsert({
    where: {
      commentedOnId_newCommentId: {
        commentedOnId,
        newCommentId
      }
    },
    update: {},
    create: { commentedOnId, newCommentId }
  });

  return NextResponse.json({ link });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const commentedOnId = String(body.commentedOnId ?? "").trim();
  const newCommentId = String(body.newCommentId ?? "").trim();

  if (!commentedOnId || !newCommentId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.commentOnComment.delete({
    where: {
      commentedOnId_newCommentId: {
        commentedOnId,
        newCommentId
      }
    }
  });

  return NextResponse.json({ ok: true });
}
