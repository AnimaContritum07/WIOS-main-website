import { NextResponse } from "next/server";
import { route, readJson, HttpError } from "@/lib/http";
import { ensureUser } from "@/lib/auth";
import {
  getEvent,
  isRegistrationOpen,
  registrationInputSchema,
  saveUserFieldValues,
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
  if (!isRegistrationOpen(event))
    throw new HttpError(403, "registrations are not open");

  const { answers } = registrationInputSchema.parse(await readJson(req));
  const clean = validateAnswers(event.fields, answers);

  const { created, updated } = await upsertRegistration(
    slug,
    user,
    clean,
    event.allowEdit,
  );
  if (!created && !updated) throw new HttpError(409, "already registered");

  await saveUserFieldValues(user.uid, event.fields, clean);

  return NextResponse.json({ ok: true, updated }, { status: created ? 201 : 200 });
});
