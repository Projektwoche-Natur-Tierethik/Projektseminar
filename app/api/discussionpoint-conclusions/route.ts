import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionPointId = String(searchParams.get("discussionPointId") ?? "").trim();
  const userId = String(searchParams.get("userId") ?? "").trim();

  const conclusions = await prisma.discussionPointConclusion.findMany({
    where: {
      ...(discussionPointId ? { discussionPointId } : null),
      ...(userId ? { userId } : null)
    }
  });

  return NextResponse.json({ conclusions });
}

export async function POST(request: Request) {
  const body = await request.json();
  const discussionPointId = String(body.discussionPointId ?? "").trim();
  const userId = String(body.userId ?? "").trim();
  const conclusion = String(body.conclusion ?? "").trim();

  if (!discussionPointId || !userId || !conclusion) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const created = await prisma.discussionPointConclusion.create({
    data: { discussionPointId, userId, conclusion }
  });

  return NextResponse.json({ conclusion: created });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const conclusionId = String(body.conclusionId ?? "").trim();
  const conclusion = String(body.conclusion ?? "").trim();

  if (!conclusionId || !conclusion) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const updated = await prisma.discussionPointConclusion.update({
    where: { id: conclusionId },
    data: { conclusion }
  });

  return NextResponse.json({ conclusion: updated });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const conclusionId = String(body.conclusionId ?? "").trim();

  if (!conclusionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.discussionPointConclusion.delete({ where: { id: conclusionId } });
  return NextResponse.json({ ok: true });
}
