import { NextResponse } from "next/server";
import { route, readJson, HttpError } from "@/lib/http";
import { ensureUser } from "@/lib/auth";
import {
  getEvent,
  registrationInputSchema,
  upsertRegistration,
  validateAnswers,
} from "@/lib/events";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export const POST = route(async (req: Request, { params }: Ctx) => {
  const user = await ensureUser(req);
  const { slug } = await params;

  const event = await getEvent(slug);
  if (!event) throw new HttpError(404, "event not found");
  if (event.status !== "open")
    throw new HttpError(403, "registrations are not open");

  const { answers } = registrationInputSchema.parse(await readJson(req));
  const clean = validateAnswers(event.fields, answers);

  const { created } = await upsertRegistration(slug, user, clean);
  if (!created) throw new HttpError(409, "already registered");

  return NextResponse.json({ ok: true }, { status: 201 });
});
