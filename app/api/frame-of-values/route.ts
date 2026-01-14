import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { isAdminParticipant } from "@/src/lib/db-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionId = String(searchParams.get("discussionId") ?? "").trim();
  const includeCounts = String(searchParams.get("includeCounts") ?? "").trim() === "true";

  if (!discussionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const items = await prisma.frameOfValue.findMany({
    where: { discussionId }
  });

  if (!includeCounts) {
    return NextResponse.json({ items });
  }

  const counts = await prisma.userValue.groupBy({
    by: ["valueId"],
    where: { discussionId },
    _count: { valueId: true }
  });

  const countMap = counts.reduce((acc, item) => {
    acc[item.valueId] = item._count.valueId;
    return acc;
  }, {} as Record<string, number>);

  const itemsWithCounts = items.map((item) => ({
    ...item,
    userValueCount: countMap[item.valueId] ?? 0
  }));

  return NextResponse.json({ items: itemsWithCounts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const valueId = String(body.valueId ?? "").trim();
  const partOfFrame = Boolean(body.partOfFrame);

  if (!discussionId || !valueId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const item = await prisma.frameOfValue.create({
    data: { discussionId, valueId, partOfFrame }
  });

  return NextResponse.json({ item });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const valueId = String(body.valueId ?? "").trim();
  const partOfFrame = body.partOfFrame;
  const adminUserId = String(body.adminUserId ?? "").trim();

  if (!discussionId || !valueId || typeof partOfFrame !== "boolean" || !adminUserId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const isAdmin = await isAdminParticipant({ discussionId, userId: adminUserId });
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const item = await prisma.frameOfValue.update({
    where: { discussionId_valueId: { discussionId, valueId } },
    data: { partOfFrame }
  });

  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const valueId = String(body.valueId ?? "").trim();

  if (!discussionId || !valueId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.frameOfValue.delete({
    where: { discussionId_valueId: { discussionId, valueId } }
  });

  return NextResponse.json({ ok: true });
}
