import { NextResponse } from "next/server";
import { valuesList } from "@/src/config/values";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const valueIdParam = String(searchParams.get("valueId") ?? "").trim();
  const valueId = valueIdParam ? Number(valueIdParam) : null;

  if (typeof valueId === "number" && Number.isInteger(valueId) && valueId >= 0) {
    const label = valuesList[valueId] ?? null;
    return NextResponse.json({ value: label ? { valueId, value: label } : null });
  }

  const values = valuesList.map((value, index) => ({
    valueId: index,
    value
  }));
  return NextResponse.json({ values });
}

export async function POST(request: Request) {
  return NextResponse.json({ error: "Not supported" }, { status: 405 });
}

export async function PUT(request: Request) {
  return NextResponse.json({ error: "Not supported" }, { status: 405 });
}

export async function DELETE(request: Request) {
  return NextResponse.json({ error: "Not supported" }, { status: 405 });
}
