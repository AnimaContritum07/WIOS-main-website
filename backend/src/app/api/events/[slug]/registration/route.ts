import { NextResponse } from "next/server";
import { route } from "@/lib/http";
import { ensureUser } from "@/lib/auth";
import { getRegistration } from "@/lib/events";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = route(async (req: Request, { params }: Ctx) => {
  const user = await ensureUser(req);
  const { slug } = await params;
  const registration = await getRegistration(slug, user.uid);
  return NextResponse.json({ registration });
});
