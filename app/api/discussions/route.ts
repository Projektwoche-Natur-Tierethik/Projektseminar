import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { generateCode } from "@/src/lib/utils";
import { valuesList } from "@/src/config/values";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionId = String(searchParams.get("discussionId") ?? "").trim();
  const codeParam = String(searchParams.get("code") ?? "").trim();
  const code = codeParam ? Number(codeParam) : null;

  if (discussionId) {
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId }
    });
    return NextResponse.json({ discussion });
  }

  if (code) {
    const discussion = await prisma.discussion.findUnique({ where: { code } });
    return NextResponse.json({ discussion });
  }

  const discussions = await prisma.discussion.findMany();
  return NextResponse.json({ discussions });
}

export async function POST(request: Request) {
  const body = await request.json();
  const discussionTheme = String(body.discussionTheme ?? "").trim();
  const inclusionProblemPartOf = Boolean(body.inclusionProblemPartOf);
  const normsPartOf = Boolean(body.normsPartOf);
  const step = Number.isFinite(body.step) ? Number(body.step) : 0;
  const valuesSelectionCount = Number.isFinite(body.valuesSelectionCount)
    ? Number(body.valuesSelectionCount)
    : undefined;
  const questionsPerParticipant = Number.isFinite(body.questionsPerParticipant)
    ? Number(body.questionsPerParticipant)
    : undefined;

  const normalizedValuesSelectionCount =
    typeof valuesSelectionCount === "number"
      ? Math.min(Math.max(Math.round(valuesSelectionCount), 1), valuesList.length)
      : undefined;
  const normalizedQuestionsPerParticipant =
    typeof questionsPerParticipant === "number"
      ? Math.min(Math.max(Math.round(questionsPerParticipant), 1), 20)
      : undefined;

  if (!discussionTheme) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let code = Number(generateCode());
  const existing = await prisma.discussion.findUnique({ where: { code } });
  if (existing) {
    code = Number(generateCode(7));
  }

  const discussion = await prisma.discussion.create({
    data: {
      code,
      discussionTheme,
      inclusionProblemPartOf,
      normsPartOf,
      ...(typeof normalizedValuesSelectionCount === "number"
        ? { valuesSelectionCount: normalizedValuesSelectionCount }
        : null),
      ...(typeof normalizedQuestionsPerParticipant === "number"
        ? { questionsPerParticipant: normalizedQuestionsPerParticipant }
        : null),
      step
    }
  });

  return NextResponse.json({ discussion });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();
  const action = String(body.action ?? "").trim();

  if (!discussionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let stepUpdate = undefined as number | undefined;
  if (action === "increment_step") {
    const current = await prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    stepUpdate = current.step + 1;
  } else if (action === "decrement_step") {
    const current = await prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    stepUpdate = Math.max(0, current.step - 1);
  } else if (Number.isFinite(body.step)) {
    stepUpdate = Number(body.step);
  }

  const discussion = await prisma.discussion.update({
    where: { id: discussionId },
    data: {
      ...(typeof body.inclusionProblemPartOf === "boolean"
        ? { inclusionProblemPartOf: body.inclusionProblemPartOf }
        : null),
      ...(typeof body.normsPartOf === "boolean" ? { normsPartOf: body.normsPartOf } : null),
      ...(typeof body.valuesSelectionCount === "number"
        ? {
            valuesSelectionCount: Math.min(
              Math.max(Math.round(body.valuesSelectionCount), 1),
              valuesList.length
            )
          }
        : null),
      ...(typeof body.questionsPerParticipant === "number"
        ? {
            questionsPerParticipant: Math.min(
              Math.max(Math.round(body.questionsPerParticipant), 1),
              20
            )
          }
        : null),
      ...(typeof stepUpdate === "number" ? { step: stepUpdate } : null)
    }
  });

  return NextResponse.json({ discussion });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const discussionId = String(body.discussionId ?? "").trim();

  if (!discussionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.discussion.delete({ where: { id: discussionId } });
  return NextResponse.json({ ok: true });
}
