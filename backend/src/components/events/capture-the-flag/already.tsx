// Capture the Ghost — already-registered page. Space Mono, warm theme.

import Link from "next/link";
import type { EventDoc } from "@/lib/event-types";
import { C, Shell } from "./theme";

export default function CaptureTheGhostAlready({ event }: { event: EventDoc }) {
  return (
    <Shell>
      <div
        className="w-full max-w-2xl border p-7 sm:p-11"
        style={{ backgroundColor: C.panel, borderColor: C.line }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.3em]"
          style={{ color: C.accent }}
        >
          Halloween CTF
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
          Already registered
        </h1>
        <p className="mt-4 text-base" style={{ color: C.muted }}>
          You&apos;ve already claimed your spot for this event.
        </p>

        <div className="mt-7">
          <Link
            href={`/events/${event.slug}`}
            className="inline-block border px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors"
            style={{ borderColor: C.accent, color: C.accent }}
          >
            Back to event
          </Link>
        </div>
      </div>
    </Shell>
  );
}
