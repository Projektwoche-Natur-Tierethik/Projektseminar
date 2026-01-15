import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionPointId = String(searchParams.get("discussionPointId") ?? "").trim();
  const likerUserId = String(searchParams.get("likerUserId") ?? "").trim();

  if (!discussionPointId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const count = await prisma.discussionPointLike.count({
    where: { discussionPointId }
  });

  if (!likerUserId) {
    return NextResponse.json({ count });
  }

  const existing = await prisma.discussionPointLike.findUnique({
    where: {
      likerUserId_discussionPointId: {
        likerUserId,
        discussionPointId
      }
    }
  });

  return NextResponse.json({ count, liked: Boolean(existing) });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const likerUserId = String(body.likerUserId ?? "").trim();
  const discussionPointId = String(body.discussionPointId ?? "").trim();

  if (!likerUserId || !discussionPointId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const like = await prisma.discussionPointLike.upsert({
    where: {
      likerUserId_discussionPointId: {
        likerUserId,
        discussionPointId
      }
    },
    update: {},
    create: { likerUserId, discussionPointId }
  });

  return NextResponse.json({ like });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const likerUserId = String(body.likerUserId ?? "").trim();
  const discussionPointId = String(body.discussionPointId ?? "").trim();

  if (!likerUserId || !discussionPointId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.discussionPointLike.delete({
    where: {
      likerUserId_discussionPointId: {
        likerUserId,
        discussionPointId
      }
    }
  });

  return NextResponse.json({ ok: true });
}
