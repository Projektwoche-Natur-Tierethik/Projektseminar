import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

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
  const valueIds = Array.isArray(body.valueIds) ? body.valueIds : [];

  if (!discussionId || !userId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.userValue.deleteMany({
    where: { discussionId, userId }
  });

  if (valueIds.length > 0) {
    await prisma.userValue.createMany({
      data: valueIds.map((valueId: string) => ({
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
