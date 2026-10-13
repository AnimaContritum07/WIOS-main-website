import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import DynamicForm from "@/components/DynamicForm";
import { getOverride } from "@/components/events/registry";

export const runtime = "nodejs";

type Props = { params: Promise<{ eventName: string }> };

export default async function RegisterPage({ params }: Props) {
  const { eventName } = await params;
  const event = await getEvent(eventName);
  if (!event || event.status === "draft") notFound();

  const Override = getOverride(event.slug, "register");
  return Override ? <Override event={event} /> : <DynamicForm event={event} />;
}
