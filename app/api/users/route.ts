import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = String(searchParams.get("userId") ?? "").trim();
  const name = String(searchParams.get("name") ?? "").trim();

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return NextResponse.json({ user });
  }

  if (name) {
    const user = await prisma.user.findUnique({ where: { name } });
    return NextResponse.json({ user });
  }

  const users = await prisma.user.findMany();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const passwordHash = String(body.passwordHash ?? "").trim();
  const salt = String(body.salt ?? "").trim();

  if (!name || !passwordHash || !salt) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: { name, passwordHash, salt }
  });

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const userId = String(body.userId ?? "").trim();
  const name = body.name ? String(body.name).trim() : undefined;
  const passwordHash = body.passwordHash ? String(body.passwordHash).trim() : undefined;
  const salt = body.salt ? String(body.salt).trim() : undefined;

  if (!userId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name ? { name } : null),
      ...(passwordHash ? { passwordHash } : null),
      ...(salt ? { salt } : null)
    }
  });

  return NextResponse.json({ user });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const userId = String(body.userId ?? "").trim();

  if (!userId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
