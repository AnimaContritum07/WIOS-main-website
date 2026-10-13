import Link from "next/link";
import { getEvent } from "@/lib/events";
import { getOverride } from "@/components/events/registry";

export const runtime = "nodejs";

type Props = { params: Promise<{ eventName: string }> };

export default async function SuccessPage({ params }: Props) {
  const { eventName } = await params;

  const event = await getEvent(eventName);
  const Override = event && getOverride(eventName, "success");
  if (Override && event) return <Override event={event} />;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-bebas text-5xl text-black">You&apos;re registered!</h1>
      <p className="font-poppins text-sm text-black/60">
        We&apos;ve saved your response. See you there.
      </p>
      <Link
        href={`/events/${eventName}`}
        className="rounded-full bg-[#8D7FB5] px-6 py-3 font-poppins text-sm font-bold text-white"
      >
        Back to event
      </Link>
    </main>
  );
}
