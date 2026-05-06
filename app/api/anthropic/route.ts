import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Anthropic endpoints have been removed." },
    { status: 410 }
  );
}
