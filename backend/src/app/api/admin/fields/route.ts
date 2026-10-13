import { NextResponse } from "next/server";
import { route } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { listFieldLibrary } from "@/lib/events";

export const runtime = "nodejs";

export const GET = route(async (req: Request) => {
  await requireAdmin(req);
  const fields = await listFieldLibrary();
  return NextResponse.json({ fields });
});
