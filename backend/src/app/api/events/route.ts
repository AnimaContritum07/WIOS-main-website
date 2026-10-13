import { NextResponse } from "next/server";
import { route, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { createEvent, eventInputSchema, listEvents } from "@/lib/events";

export const runtime = "nodejs";

export const GET = route(async () => {
  const events = await listEvents(true);
  return NextResponse.json({ events });
});

export const POST = route(async (req: Request) => {
  const admin = await requireAdmin(req);
  const input = eventInputSchema.parse(await readJson(req));
  const event = await createEvent(input, admin.uid);
  return NextResponse.json({ event }, { status: 201 });
});
