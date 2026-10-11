import { NextResponse } from "next/server";
import { db } from "@/config/firebase";

export const runtime = "nodejs";

export async function GET() {
  try {
    await db.collection("_connection_test").limit(1).get();

    return NextResponse.json({
      status: "ok",
      firebase: "connected",
    });
  } catch (error) {
    console.error("Firebase connection failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown Firebase error";

    return NextResponse.json(
      {
        status: "error",
        firebase: "connection failed",
        message:
          process.env.NODE_ENV === "development"
            ? message
            : undefined,
      },
      { status: 500 }
    );
  }
}