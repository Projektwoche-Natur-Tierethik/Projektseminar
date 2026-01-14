import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { generateCode } from "@/src/lib/utils";
import { getOrCreateUserByName } from "@/src/lib/db-helpers";

export async function POST(request: Request) {
  const body = await request.json();
  const question = String(body.question ?? "").trim();
  const hostName = String(body.hostName ?? "").trim();

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
