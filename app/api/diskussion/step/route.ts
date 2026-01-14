import { NextResponse } from "next/server";

// TODO: This legacy endpoint is slated for deletion once the new API is used.
export async function POST(request: Request) {
  const body = await request.json();
  const code = Number(String(body.code ?? "").trim());
  const name = String(body.name ?? "").trim();
  const step = Number(body.step);
  const response = String(body.response ?? "").trim();

  if (!code || !name || !step || !response) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
