import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = Number(String(searchParams.get("code") ?? "").trim());

  const discussion = await prisma.discussion.findUnique({
    where: { code }
  });

  if (!discussion) {
    return NextResponse.json({ topValues: [] });
  }

  const counts = await prisma.userValue.groupBy({
    by: ["valueId"],
    where: { discussionId: discussion.id },
    _count: { valueId: true }
  });

  const values = await prisma.value.findMany({
    where: { id: { in: counts.map((item) => item.valueId) } }
  });

  const valueMap = values.reduce((acc, item) => {
    acc[item.id] = item.value;
    return acc;
  }, {} as Record<string, string>);

  const topValues = counts
    .map((item) => ({
      value: valueMap[item.valueId] ?? item.valueId,
      count: item._count.valueId
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ topValues });
}

export async function POST(request: Request) {
  const body = await request.json();
  const code = Number(String(body.code ?? "").trim());
  const name = String(body.name ?? "").trim();
  const values = Array.isArray(body.values) ? body.values : [];

  const discussion = await prisma.discussion.findUnique({ where: { code } });

  if (!discussion || !name) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participant = await prisma.participant.findUnique({
    where: { userId_discussionId: { userId: user.id, discussionId: discussion.id } }
  });

  if (discussion.step < 1 && !participant?.admin) {
    return NextResponse.json({ error: "Not started" }, { status: 403 });
  }

  await prisma.userValue.deleteMany({
    where: { discussionId: discussion.id, userId: user.id }
  });

  if (values.length > 0) {
    const valueRecords = await Promise.all(
      values.map(async (valueLabel: string) => {
        const existing = await prisma.value.findUnique({ where: { value: valueLabel } });
        if (existing) {
          return existing;
        }
        return prisma.value.create({ data: { value: valueLabel } });
      })
    );

    for (const valueRecord of valueRecords) {
      try {
        await prisma.frameOfValue.create({
          data: {
            discussionId: discussion.id,
            valueId: valueRecord.id,
            partOfFrame: false
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          continue;
        }
        throw error;
      }
    }

    await prisma.userValue.createMany({
      data: valueRecords.map((valueRecord) => ({
        discussionId: discussion.id,
        valueId: valueRecord.id,
        userId: user.id
      }))
    });
  }

  return NextResponse.json({ ok: true });
}
