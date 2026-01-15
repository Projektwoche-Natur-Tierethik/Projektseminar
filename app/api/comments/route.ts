import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commentId = String(searchParams.get("commentId") ?? "").trim();
  const writtenByUserId = String(searchParams.get("writtenByUserId") ?? "").trim();

  const comments = await prisma.comment.findMany({
    where: {
      ...(commentId ? { id: commentId } : null),
      ...(writtenByUserId ? { writtenByUserId } : null)
    }
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const body = await request.json();
  const writtenByUserId = String(body.writtenByUserId ?? "").trim();
  const comment = String(body.comment ?? "").trim();

  if (!writtenByUserId || !comment) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const created = await prisma.comment.create({
    data: { writtenByUserId, comment }
  });

  return NextResponse.json({ comment: created });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const commentId = String(body.commentId ?? "").trim();
  const comment = String(body.comment ?? "").trim();

  if (!commentId || !comment) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { comment, edited: true }
  });

  return NextResponse.json({ comment: updated });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const commentId = String(body.commentId ?? "").trim();

  if (!commentId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
