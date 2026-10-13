import { NextResponse } from "next/server";
import { route, HttpError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { removeAdminEmail } from "@/lib/admin-emails";
import { isAdminEmail } from "@/config/admins";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ email: string }> };

export const DELETE = route(async (req: Request, { params }: Ctx) => {
  const admin = await requireAdmin(req);
  const { email } = await params;
  const target = decodeURIComponent(email).toLowerCase();

  if (isAdminEmail(target))
    throw new HttpError(400, "cannot remove an admin set in env");
  if (target === admin.email.toLowerCase())
    throw new HttpError(400, "cannot remove yourself");

  await removeAdminEmail(target);
  return NextResponse.json({ ok: true });
});
