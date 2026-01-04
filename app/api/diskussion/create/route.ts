import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { generateCode } from "@/src/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const question = String(body.question ?? "").trim();
  const hostName = String(body.hostName ?? "").trim();

  if (!question) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  let code = generateCode();
  const existing = await prisma.discussion.findUnique({ where: { code } });
  if (existing) {
    code = generateCode(7);
  }

  const discussion = await prisma.discussion.create({
    data: {
      code,
      question,
      participants: hostName
        ? {
            create: {
              name: hostName,
              isHost: true
            }
          }
        : undefined
    }
  });

  return NextResponse.json({ code: discussion.code });
}
