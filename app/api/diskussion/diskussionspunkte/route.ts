import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { isAdminParticipant } from "@/src/lib/db-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionId = String(searchParams.get("discussionId") ?? "").trim();
  const discussionPointId = String(searchParams.get("discussionPointId") ?? "").trim();
  const countWrittenByUserId = String(searchParams.get("countWrittenByUserId") ?? "").trim();

  if (countWrittenByUserId && discussionId) {
    const count = await prisma.discussionPoint.count({
      where: { discussionId, writtenByUserId: countWrittenByUserId }
    });
    return NextResponse.json({ count });
  }

  const items = await prisma.discussionPoint.findMany({
    where: {
      ...(discussionId ? { discussionId } : null),
      ...(discussionPointId ? { id: discussionPointId } : null)
    }
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const writtenByUserId = String(body.writtenByUserId ?? "").trim();
  const discussionPoint = String(body.discussionPoint ?? "").trim();

  if (!discussionId || !writtenByUserId || !discussionPoint) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const created = await prisma.discussionPoint.create({
    data: { discussionId, writtenByUserId, discussionPoint }
  });

  return NextResponse.json({ item: created });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const discussionPointId = String(body.discussionPointId ?? "").trim();
  const markedAsComplete = body.markedAsComplete;
  const adminUserId = String(body.adminUserId ?? "").trim();

  if (!discussionPointId || typeof markedAsComplete !== "boolean" || !adminUserId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const discussionPoint = await prisma.discussionPoint.findUnique({
    where: { id: discussionPointId }
  });

  if (!discussionPoint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = await isAdminParticipant({
    discussionId: discussionPoint.discussionId,
    userId: adminUserId
  });

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.discussionPoint.update({
    where: { id: discussionPointId },
    data: { markedAsComplete }
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const discussionPointId = String(body.discussionPointId ?? "").trim();

  if (!discussionPointId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.discussionPoint.delete({ where: { id: discussionPointId } });

  return NextResponse.json({ ok: true });
}
