import { NextResponse } from "next/server";
import { route } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { listEvents } from "@/lib/events";

export const runtime = "nodejs";

export const GET = route(async (req: Request) => {
  await requireAdmin(req);
  const events = await listEvents(false);
  return NextResponse.json({ events });
});
