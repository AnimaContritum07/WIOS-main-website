import { NextResponse } from "next/server";
import { z } from "zod";
import { route, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { renameFieldKey } from "@/lib/events";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ globalId: string }> };

const bodySchema = z.object({ label: z.string().min(1) });

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin(req);
  const { globalId } = await params;
  const { label } = bodySchema.parse(await readJson(req));
  await renameFieldKey(globalId, label);
  return NextResponse.json({ ok: true, globalId, label });
});
