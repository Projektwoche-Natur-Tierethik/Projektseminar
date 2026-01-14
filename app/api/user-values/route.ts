import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { resolveValueId } from "@/src/lib/value-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionId = String(searchParams.get("discussionId") ?? "").trim();
  const userId = String(searchParams.get("userId") ?? "").trim();

  if (!discussionId || !userId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const items = await prisma.userValue.findMany({
    where: { discussionId, userId }
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const userId = String(body.userId ?? "").trim();
  const rawValueIds = Array.isArray(body.valueIds) ? body.valueIds : [];
  const rawValues = Array.isArray(body.values) ? body.values : [];

  if (!discussionId || !userId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const resolvedValueIds = [
    ...rawValueIds.map(resolveValueId),
    ...rawValues.map(resolveValueId)
  ].filter((valueId): valueId is number => typeof valueId === "number");

  const uniqueValueIds = Array.from(new Set(resolvedValueIds));

  await prisma.userValue.deleteMany({
    where: { discussionId, userId }
  });

  if (uniqueValueIds.length > 0) {
    await Promise.all(
      uniqueValueIds.map((valueId) =>
        prisma.frameOfValue.upsert({
          where: { discussionId_valueId: { discussionId, valueId } },
          update: {},
          create: { discussionId, valueId, partOfFrame: false }
        })
      )
    );

    await prisma.userValue.createMany({
      data: uniqueValueIds.map((valueId) => ({
        discussionId,
        userId,
        valueId
      }))
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const userId = String(body.userId ?? "").trim();

  if (!discussionId || !userId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.userValue.deleteMany({ where: { discussionId, userId } });
  return NextResponse.json({ ok: true });
}
