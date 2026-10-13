import ExcelJS from "exceljs";
import { route, HttpError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { getEvent, listRegistrations, type FormField } from "@/lib/events";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin(req);
  const { slug } = await params;

  const event = await getEvent(slug);
  if (!event) throw new HttpError(404, "event not found");
  const registrations = await listRegistrations(slug);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Registrations");

  ws.columns = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Registered At", key: "createdAt" },
    ...event.fields.map((f: FormField) => ({ header: f.label, key: f.id })),
  ];

  for (const reg of registrations) {
    const row: Record<string, string> = {
      name: reg.name ?? "",
      email: reg.email,
      createdAt: reg.createdAt,
    };
    for (const f of event.fields) {
      const v = reg.answers[f.id];
      row[f.id] = Array.isArray(v) ? v.join(", ") : (v ?? "");
    }
    ws.addRow(row);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${slug}-registrations.xlsx"`,
    },
  });
});
