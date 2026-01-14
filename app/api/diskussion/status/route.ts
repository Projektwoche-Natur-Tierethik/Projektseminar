import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = String(searchParams.get("code") ?? "").trim().toUpperCase();
  const name = String(searchParams.get("name") ?? "").trim();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({
    where: { code },
    include: name ? { participants: true } : undefined
  });

  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participant = name
    ? discussion.participants.find((item) => item.name === name)
    : null;

  return NextResponse.json({
    currentStep: discussion.currentStep,
    isHost: participant?.isHost ?? false
  });
}
