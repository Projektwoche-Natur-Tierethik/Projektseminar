import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getValueLabel, resolveValueId } from "@/src/lib/value-helpers";

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

  const topValues = counts
    .map((item) => ({
      value: getValueLabel(item.valueId) ?? String(item.valueId),
      count: item._count.valueId
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ topValues });
}

export async function POST(request: Request) {
  const body = await request.json();
  const code = Number(String(body.code ?? "").trim());
  const name = String(body.name ?? "").trim();
  const values: unknown[] = Array.isArray(body.values) ? body.values : [];

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
    const resolvedValueIds = values
      .map(resolveValueId)
      .filter((valueId): valueId is number => typeof valueId === "number");

    const uniqueValueIds = Array.from(new Set(resolvedValueIds));

    await Promise.all(
      uniqueValueIds.map((valueId) =>
        prisma.frameOfValue.upsert({
          where: { discussionId_valueId: { discussionId: discussion.id, valueId } },
          update: {},
          create: { discussionId: discussion.id, valueId, partOfFrame: false }
        })
      )
    );

    await prisma.userValue.createMany({
      data: uniqueValueIds.map((valueId) => ({
        discussionId: discussion.id,
        valueId,
        userId: user.id
      }))
    });
  }

  return NextResponse.json({ ok: true });
}
