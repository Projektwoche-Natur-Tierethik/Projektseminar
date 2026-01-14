import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { generateCode } from "@/src/lib/utils";
import { getOrCreateUserByName } from "@/src/lib/db-helpers";
import { valuesList } from "@/src/config/values";

export async function POST(request: Request) {
  const body = await request.json();
  const question = String(body.question ?? "").trim();
  const hostName = String(body.hostName ?? "").trim();
  const normsPartOf = typeof body.normsPartOf === "boolean" ? body.normsPartOf : false;
  const inclusionProblemPartOf =
    typeof body.inclusionProblemPartOf === "boolean" ? body.inclusionProblemPartOf : false;
  const valuesSelectionCount = Number.isFinite(body.selectionCount)
    ? Number(body.selectionCount)
    : 10;
  const questionsPerParticipant = Number.isFinite(body.questionsPerParticipant)
    ? Number(body.questionsPerParticipant)
    : 5;

  const normalizedValuesSelectionCount = Math.min(
    Math.max(Math.round(valuesSelectionCount), 1),
    valuesList.length
  );
  const normalizedQuestionsPerParticipant = Math.min(
    Math.max(Math.round(questionsPerParticipant), 1),
    20
  );

  if (!question || !hostName) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  let code = Number(generateCode());
  const existing = await prisma.discussion.findUnique({ where: { code } });
  if (existing) {
    code = Number(generateCode(7));
  }

  let hostUser = null;
  if (hostName) {
    hostUser = await getOrCreateUserByName(hostName);
  }

  const discussion = await prisma.discussion.create({
    data: {
      code,
      discussionTheme: question,
      normsPartOf,
      inclusionProblemPartOf,
      valuesSelectionCount: normalizedValuesSelectionCount,
      questionsPerParticipant: normalizedQuestionsPerParticipant,
      participants: hostUser
        ? {
            create: {
              userId: hostUser.id,
              admin: true
            }
          }
        : undefined
    }
  });

  return NextResponse.json({ code: String(discussion.code) });
}
