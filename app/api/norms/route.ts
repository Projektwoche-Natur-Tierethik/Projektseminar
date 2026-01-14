import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { isAdminParticipant } from "@/src/lib/db-helpers";
import { resolveValueId } from "@/src/lib/value-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionId = String(searchParams.get("discussionId") ?? "").trim();
  const userId = String(searchParams.get("userId") ?? "").trim();
  const countForUser = String(searchParams.get("countForUser") ?? "").trim() === "true";

  if (countForUser && discussionId && userId) {
    const count = await prisma.norm.count({
      where: { discussionId, userId }
    });
    return NextResponse.json({ count });
  }

  const norms = await prisma.norm.findMany({
    where: {
      ...(discussionId ? { discussionId } : null),
      ...(userId ? { userId } : null)
    }
  });

  return NextResponse.json({ norms });
}

export async function POST(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const userId = String(body.userId ?? "").trim();
  const norm = String(body.norm ?? "").trim();
  const basedOnValueId = resolveValueId(body.basedOnValueId ?? body.basedOnValue);
  const partOfFrame = Boolean(body.partOfFrame);

  if (!discussionId || !userId || !norm || !basedOnValueId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const created = await prisma.norm.create({
    data: {
      discussionId,
      userId,
      norm,
      basedOnValueId,
      partOfFrame
    }
  });

  return NextResponse.json({ norm: created });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const normId = String(body.normId ?? "").trim();
  const norm = body.norm ? String(body.norm).trim() : undefined;
  const partOfFrame = body.partOfFrame;
  const adminUserId = String(body.adminUserId ?? "").trim();

  if (!normId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (typeof partOfFrame === "boolean") {
    if (!adminUserId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const existing = await prisma.norm.findUnique({ where: { id: normId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const isAdmin = await isAdminParticipant({
      discussionId: existing.discussionId,
      userId: adminUserId
    });
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated = await prisma.norm.update({
    where: { id: normId },
    data: {
      ...(norm ? { norm } : null),
      ...(typeof partOfFrame === "boolean" ? { partOfFrame } : null)
    }
  });

  return NextResponse.json({ norm: updated });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const normId = String(body.normId ?? "").trim();

  if (!normId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.norm.delete({ where: { id: normId } });

  return NextResponse.json({ ok: true });
}
