import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const valueId = String(searchParams.get("valueId") ?? "").trim();

  if (valueId) {
    const value = await prisma.value.findUnique({ where: { id: valueId } });
    return NextResponse.json({ value });
  }

  const values = await prisma.value.findMany();
  return NextResponse.json({ values });
}

export async function POST(request: Request) {
  const body = await request.json();
  const value = String(body.value ?? "").trim();

  if (!value) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const created = await prisma.value.create({ data: { value } });
  return NextResponse.json({ value: created });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const valueId = String(body.valueId ?? "").trim();
  const value = String(body.value ?? "").trim();

  if (!valueId || !value) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const updated = await prisma.value.update({
    where: { id: valueId },
    data: { value }
  });

  return NextResponse.json({ value: updated });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const valueId = String(body.valueId ?? "").trim();

  if (!valueId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.value.delete({ where: { id: valueId } });
  return NextResponse.json({ ok: true });
}
