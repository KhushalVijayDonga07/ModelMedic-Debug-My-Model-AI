import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Chat has been disabled in the local diagnosis build." },
    { status: 410 }
  );
}
