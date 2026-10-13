import { NextResponse } from "next/server";
import { route, readJson, HttpError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import {
  deleteEvent,
  eventPatchSchema,
  getEvent,
  updateEvent,
} from "@/lib/events";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = route(async (_req: Request, { params }: Ctx) => {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) throw new HttpError(404, "event not found");
  return NextResponse.json({ event });
});

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin(req);
  const { slug } = await params;
  const patch = eventPatchSchema.parse(await readJson(req));
  const event = await updateEvent(slug, patch);
  return NextResponse.json({ event });
});

export const DELETE = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin(req);
  const { slug } = await params;
  await deleteEvent(slug);
  return NextResponse.json({ ok: true });
});
