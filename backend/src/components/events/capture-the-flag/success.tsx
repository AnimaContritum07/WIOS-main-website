// Capture the Ghost — success page. 

import Link from "next/link";
import type { EventDoc } from "@/lib/event-types";
import { C, Shell, GhostTitle } from "./theme";

const WHATSAPP = "https://chat.whatsapp.com/BiM88jQhh2i3oqvrRJOTLc?s=sh&p=a&mlu=4&ilr=4";

export default function CaptureTheGhostSuccess({ event }: { event: EventDoc }) {
  return (
    <Shell>
      <div
        className="w-full max-w-2xl border p-7 backdrop-blur-sm sm:p-11"
        style={{ backgroundColor: C.panel, borderColor: C.line }}
      >
        <GhostTitle title={event.title} className="text-3xl sm:text-5xl" />
        <p className="mt-6 text-lg font-bold" style={{ color: C.accent }}>
          You&apos;re in the hunt.
        </p>
        <p className="mt-2 text-base" style={{ color: C.muted }}>
          Your registration is saved. Join the WhatsApp group for updates.
        </p>

        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-block px-8 py-3.5 text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-90"
          style={{ backgroundColor: C.accent, color: C.bg }}
        >
          Join the WhatsApp group
        </a>

        <div className="mt-6">
          <Link
            href={`/events/${event.slug}`}
            className="text-sm font-bold underline-offset-4 hover:underline"
            style={{ color: C.gold }}
          >
            Back to event
          </Link>
        </div>
      </div>
    </Shell>
  );
}
