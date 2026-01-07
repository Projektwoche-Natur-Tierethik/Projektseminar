import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const name = String(body.name ?? "").trim();

  if (!code || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({ where: { code } });
  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.participant.findUnique({
    where: { discussionId_name: { discussionId: discussion.id, name } }
  });

  if (!existing) {
    await prisma.participant.create({
      data: { name, discussionId: discussion.id }
    });
  }

  return NextResponse.json({ ok: true });
}
