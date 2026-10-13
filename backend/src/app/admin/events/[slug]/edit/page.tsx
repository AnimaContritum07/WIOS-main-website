import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import FormBuilder from "@/components/FormBuilder";

export const runtime = "nodejs";

type Props = { params: Promise<{ slug: string }> };

export default async function EditEventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  return (
    <main className="min-h-screen bg-white px-6">
      <FormBuilder initial={event} />
    </main>
  );
}
