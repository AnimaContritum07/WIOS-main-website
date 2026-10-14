import { NextResponse } from "next/server";
import { route, readJson, HttpError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import {
  deleteEvent,
  getEventByIdOrSlug,
  updateEvent,
  updateEventSchema,
} from "@/modules/events";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

// GET /api/events/[id or slug] -> single event with full details and images
export const GET = route(async (_req: Request, { params }: Ctx) => {
  const { slug } = await params;
  const event = await getEventByIdOrSlug(slug);
  if (!event) {
    throw new HttpError(404, `Event not found: ${slug}`);
  }
  return NextResponse.json({ event });
});

// PUT /api/events/[id or slug] -> admin updates event
export const PUT = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin(req);
  const { slug } = await params;
  const body = await readJson(req);
  const update = updateEventSchema.parse(body);
  const event = await updateEvent(slug, update);
  return NextResponse.json({ event });
});

// PATCH /api/events/[id or slug] -> admin updates event (alias for PUT)
export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin(req);
  const { slug } = await params;
  const body = await readJson(req);
  const update = updateEventSchema.parse(body);
  const event = await updateEvent(slug, update);
  return NextResponse.json({ event });
});

// DELETE /api/events/[id or slug] -> admin deletes event
export const DELETE = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin(req);
  const { slug } = await params;
  await deleteEvent(slug);
  return NextResponse.json({ ok: true, message: `Event "${slug}" deleted successfully` });
});
