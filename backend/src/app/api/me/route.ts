import { NextResponse } from "next/server";
import { route } from "@/lib/http";
import { ensureUser } from "@/lib/auth";

export const runtime = "nodejs";

export const GET = route(async (req: Request) => {
  const user = await ensureUser(req);
  return NextResponse.json({ user });
});
