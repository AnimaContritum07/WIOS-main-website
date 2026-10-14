import { NextResponse } from "next/server";
import { route, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { deleteEventImage } from "@/modules/upload/upload.service";
import { deleteImageInputSchema } from "@/modules/upload/upload.schema";

export const runtime = "nodejs";

export const DELETE = route(async (req: Request) => {
  await requireAdmin(req);
  let key: string | null = null;
  let eventId: string | undefined = undefined;

  const url = new URL(req.url);
  key = url.searchParams.get("key");
  eventId = url.searchParams.get("eventId") ?? undefined;

  if (!key) {
    const body = await readJson(req).catch(() => ({}));
    const parsed = deleteImageInputSchema.safeParse(body);
    if (parsed.success) {
      key = parsed.data.key;
      eventId = parsed.data.eventId ?? eventId;
    }
  }

  if (!key) {
    return NextResponse.json(
      { error: "Image key is required to delete" },
      { status: 400 },
    );
  }

  const result = await deleteEventImage(key, eventId);
  return NextResponse.json({
    ok: true,
    message: "Image deleted successfully",
    uploadThingResult: result,
  });
});

export const POST = route(async (req: Request) => {
  await requireAdmin(req);
  const body = await readJson(req);
  const { key, eventId } = deleteImageInputSchema.parse(body);

  const result = await deleteEventImage(key, eventId);
  return NextResponse.json({
    ok: true,
    message: "Image deleted successfully",
    uploadThingResult: result,
  });
});
