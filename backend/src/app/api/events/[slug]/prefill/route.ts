import { NextResponse } from "next/server";
import { route, HttpError } from "@/lib/http";
import { ensureUser } from "@/lib/auth";
import { buildPrefill, getEvent, getUserSavedFields } from "@/lib/events";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = route(async (req: Request, { params }: Ctx) => {
  const user = await ensureUser(req);
  const { slug } = await params;

  const event = await getEvent(slug);
  if (!event) throw new HttpError(404, "event not found");

  const saved = await getUserSavedFields(user.uid);
  return NextResponse.json({ prefill: buildPrefill(event, saved) });
});
