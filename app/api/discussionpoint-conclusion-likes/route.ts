import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionPointId = String(searchParams.get("discussionPointId") ?? "").trim();
  const conclusionUserId = String(searchParams.get("conclusionUserId") ?? "").trim();
  const likerUserId = String(searchParams.get("likerUserId") ?? "").trim();

  if (!discussionPointId || !conclusionUserId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const conclusion = await prisma.discussionPointConclusion.findFirst({
    where: { discussionPointId, userId: conclusionUserId }
  });

  if (!conclusion) {
    return NextResponse.json({ count: 0, liked: false });
  }

  const count = await prisma.discussionPointConclusionLike.count({
    where: { dpConclusionId: conclusion.id, conclusionWrittenByUserId: conclusionUserId }
  });

  if (!likerUserId) {
    return NextResponse.json({ count });
  }

  const existing = await prisma.discussionPointConclusionLike.findUnique({
    where: {
      likerUserId_dpConclusionId_conclusionWrittenByUserId: {
        likerUserId,
        dpConclusionId: conclusion.id,
        conclusionWrittenByUserId: conclusionUserId
      }
    }
  });

  return NextResponse.json({ count, liked: Boolean(existing) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const likerUserId = String(body.likerUserId ?? "").trim();
  const dpConclusionId = String(body.dpConclusionId ?? "").trim();
  const conclusionWrittenByUserId = String(body.conclusionWrittenByUserId ?? "").trim();

  if (!likerUserId || !dpConclusionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let authorId = conclusionWrittenByUserId;
  if (!authorId) {
    const conclusion = await prisma.discussionPointConclusion.findUnique({
      where: { id: dpConclusionId }
    });
    if (!conclusion) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    authorId = conclusion.userId;
  }

  const like = await prisma.discussionPointConclusionLike.create({
    data: {
      likerUserId,
      dpConclusionId,
      conclusionWrittenByUserId: authorId
    }
  });

  return NextResponse.json({ like });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const likerUserId = String(body.likerUserId ?? "").trim();
  const dpConclusionId = String(body.dpConclusionId ?? "").trim();
  const conclusionWrittenByUserId = String(body.conclusionWrittenByUserId ?? "").trim();

  if (!likerUserId || !dpConclusionId || !conclusionWrittenByUserId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.discussionPointConclusionLike.delete({
    where: {
      likerUserId_dpConclusionId_conclusionWrittenByUserId: {
        likerUserId,
        dpConclusionId,
        conclusionWrittenByUserId
      }
    }
  });

  return NextResponse.json({ ok: true });
}
