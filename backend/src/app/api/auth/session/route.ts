import { NextResponse } from "next/server";
import { route } from "@/lib/http";
import { ensureUser } from "@/lib/auth";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  const user = await ensureUser(req);
  return NextResponse.json({ user });
});
