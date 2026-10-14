import { NextResponse } from "next/server";
import { route, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import {
  createEvent,
  createEventSchema,
  listEvents,
} from "@/modules/events";

export const runtime = "nodejs";

// GET /api/events -> list all events with details and images
export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const includeDrafts = url.searchParams.get("drafts") === "true";
  const events = await listEvents({ publicOnly: !includeDrafts });
  return NextResponse.json({ events });
});

// POST /api/events -> admin creates event
export const POST = route(async (req: Request) => {
  const admin = await requireAdmin(req);
  const body = await readJson(req);
  const input = createEventSchema.parse(body);
  const event = await createEvent(input, admin.uid);
  return NextResponse.json({ event }, { status: 201 });
});
