import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";

export async function getOrCreateUserByName(name: string) {
  const existing = await prisma.user.findUnique({ where: { name } });
  if (existing) {
    return existing;
  }

  const salt = crypto.randomUUID();
  const passwordHash = `guest:${salt}`;

  return prisma.user.create({
    data: {
      name,
      passwordHash,
      salt
    }
  });
}

export async function getOrCreateParticipant(options: {
  discussionId: string;
  userId: string;
  admin?: boolean;
}) {
  const { discussionId, userId, admin = false } = options;

  const existing = await prisma.participant.findUnique({
    where: { userId_discussionId: { userId, discussionId } }
  });

  if (existing) {
    return existing;
  }

  return prisma.participant.create({
    data: {
      discussionId,
      userId,
      admin
    }
  });
}

export async function isAdminParticipant(options: {
  discussionId: string;
  userId: string;
}) {
  const { discussionId, userId } = options;
  const participant = await prisma.participant.findUnique({
    where: { userId_discussionId: { userId, discussionId } }
  });

  return participant?.admin ?? false;
}
