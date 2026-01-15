import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commentId = String(searchParams.get("commentId") ?? "").trim();
  const likerUserId = String(searchParams.get("likerUserId") ?? "").trim();

  if (!commentId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const count = await prisma.commentLike.count({
    where: { commentId }
  });

  if (!likerUserId) {
    return NextResponse.json({ count });
  }

  const existing = await prisma.commentLike.findUnique({
    where: {
      likerUserId_commentId: {
        likerUserId,
        commentId
      }
    }
  });

  return NextResponse.json({ count, liked: Boolean(existing) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const likerUserId = String(body.likerUserId ?? "").trim();
  const commentId = String(body.commentId ?? "").trim();

  if (!likerUserId || !commentId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const like = await prisma.commentLike.create({
    data: { likerUserId, commentId }
  });

  return NextResponse.json({ like });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const likerUserId = String(body.likerUserId ?? "").trim();
  const commentId = String(body.commentId ?? "").trim();

  if (!likerUserId || !commentId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.commentLike.delete({
    where: {
      likerUserId_commentId: {
        likerUserId,
        commentId
      }
    }
  });

  return NextResponse.json({ ok: true });
}
