import { NextResponse } from "next/server";
import { z } from "zod";
import { route, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { addAdminEmail, listAdminEmails } from "@/lib/admin-emails";

export const runtime = "nodejs";

const bodySchema = z.object({ email: z.string().email() });

export const GET = route(async (req: Request) => {
  await requireAdmin(req);
  const admins = await listAdminEmails();
  return NextResponse.json({ admins });
});

export const POST = route(async (req: Request) => {
  const admin = await requireAdmin(req);
  const { email } = bodySchema.parse(await readJson(req));
  await addAdminEmail(email, admin.uid);
  return NextResponse.json({ ok: true }, { status: 201 });
});
