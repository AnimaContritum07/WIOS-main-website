import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import RegistrationsTable from "@/components/RegistrationsTable";

export const runtime = "nodejs";

type Props = { params: Promise<{ eventName: string }> };

export default async function UsersPage({ params }: Props) {
  const { eventName } = await params;
  const event = await getEvent(eventName);
  if (!event) notFound();
  return <RegistrationsTable event={event} />;
}
