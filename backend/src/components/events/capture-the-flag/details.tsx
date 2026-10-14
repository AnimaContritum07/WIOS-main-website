// Capture the Ghost — details page. Space Mono, warm solid theme.

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type EventDoc, isRegistrationOpen } from "@/lib/event-types";
import { C, Shell } from "./theme";

export default function CaptureTheGhostDetails({ event }: { event: EventDoc }) {
  const open = isRegistrationOpen(event);
  const poster = event.theme?.poster ?? event.bannerUrl;
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <Shell center={false}>
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {poster && (
          <div
            className="h-56 w-full border bg-cover bg-center"
            style={{ borderColor: C.line, backgroundImage: `url(${poster})` }}
          />
        )}

        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: C.accent }}
          >
            Halloween CTF
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            {event.title}
          </h1>
        </div>

        <div
          className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-bold"
          style={{ color: C.muted }}
        >
          {event.startsAt && <span>When: {fmt(event.startsAt)}</span>}
          {event.location && <span>Where: {event.location}</span>}
        </div>

        {event.description && (
          <div
            className="border p-6"
            style={{ borderColor: C.line, backgroundColor: C.panel }}
          >
            <div
              className="prose-wios flex flex-col gap-2 text-sm leading-relaxed"
              style={{ color: C.text }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {event.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {event.registrationDeadline && (
          <p className="text-sm" style={{ color: C.muted }}>
            Registration closes {fmt(event.registrationDeadline)}
          </p>
        )}

        {open ? (
          <Link
            href={`/events/${event.slug}/register`}
            className="self-start px-8 py-3.5 text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.accent, color: C.bg }}
          >
            Register
          </Link>
        ) : (
          <p className="text-sm font-bold" style={{ color: C.danger }}>
            Registrations closed
          </p>
        )}
      </div>
    </Shell>
  );
}
