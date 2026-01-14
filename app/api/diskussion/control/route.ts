import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type ControlAction = "start" | "next" | "finish";

export async function POST(request: Request) {
  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const name = String(body.name ?? "").trim();
  const action = String(body.action ?? "").trim() as ControlAction;

  if (!code || !name || !action) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({ where: { code } });

  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participant = await prisma.participant.findUnique({
    where: { discussionId_name: { discussionId: discussion.id, name } }
  });

  if (!participant?.isHost) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let nextStep = discussion.currentStep;

  if (action === "start") {
    nextStep = discussion.currentStep > 0 ? discussion.currentStep : 1;
  } else if (action === "next") {
    const baseStep = discussion.currentStep === 0 ? 1 : discussion.currentStep + 1;
    nextStep = Math.min(baseStep, 6);
  } else if (action === "finish") {
    nextStep = 6;
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.discussion.update({
    where: { id: discussion.id },
    data: { currentStep: nextStep }
  });

  return NextResponse.json({ currentStep: updated.currentStep });
}
