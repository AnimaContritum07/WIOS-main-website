import { NextResponse } from "next/server";
import { route } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { listRegistrations } from "@/lib/events";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin(req);
  const { slug } = await params;
  const registrations = await listRegistrations(slug);
  return NextResponse.json({ registrations });
});
