import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = Number(String(searchParams.get("code") ?? "").trim());
  const name = String(searchParams.get("name") ?? "").trim();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({ where: { code } });

  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let participant = null;
  if (name) {
    const user = await prisma.user.findUnique({ where: { name } });
    if (user) {
      participant = await prisma.participant.findUnique({
        where: { userId_discussionId: { userId: user.id, discussionId: discussion.id } }
      });
    }
  }

  return NextResponse.json({
    currentStep: discussion.step,
    isHost: participant?.admin ?? false
  });
}
