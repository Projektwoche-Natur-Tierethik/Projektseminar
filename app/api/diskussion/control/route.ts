import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type ControlAction = "start" | "next" | "prev" | "finish";

export async function POST(request: Request) {
  const body = await request.json();
  const code = Number(String(body.code ?? "").trim());
  const name = String(body.name ?? "").trim();
  const action = String(body.action ?? "").trim() as ControlAction;

  if (!code || !name || !action) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const discussion = await prisma.discussion.findUnique({ where: { code } });

  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const participant = await prisma.participant.findUnique({
    where: { userId_discussionId: { userId: user.id, discussionId: discussion.id } }
  });

  if (!participant?.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let nextStep = discussion.step;

  if (action === "start") {
    nextStep = discussion.step > 0 ? discussion.step : 1;
  } else if (action === "next") {
    const baseStep = discussion.step === 0 ? 1 : discussion.step + 1;
    nextStep = Math.min(baseStep, 6);
  } else if (action === "prev") {
    nextStep = Math.max(discussion.step - 1, 0);
  } else if (action === "finish") {
    nextStep = 6;
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.discussion.update({
    where: { id: discussion.id },
    data: { step: nextStep }
  });

  return NextResponse.json({ currentStep: updated.step });
}
