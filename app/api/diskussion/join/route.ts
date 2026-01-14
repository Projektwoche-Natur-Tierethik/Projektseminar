import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getOrCreateUserByName, getOrCreateParticipant } from "@/src/lib/db-helpers";

export async function POST(request: Request) {
  const body = await request.json();
  const code = Number(String(body.code ?? "").trim());
  const name = String(body.name ?? "").trim();

  if (!code || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({ where: { code } });
  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await getOrCreateUserByName(name);
  await getOrCreateParticipant({ discussionId: discussion.id, userId: user.id });

  return NextResponse.json({ ok: true });
}
