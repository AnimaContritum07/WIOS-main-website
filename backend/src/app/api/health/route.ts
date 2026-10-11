// Intentionally blank starter file. Add implementation here.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "Next.js API is running",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}