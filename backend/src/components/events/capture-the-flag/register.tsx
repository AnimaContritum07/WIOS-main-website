"use client";

// Capture the Ghost — clean CTF register page. Space Mono, warm solid bg.

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type EventDoc, isRegistrationOpen } from "@/lib/event-types";
import { useRegister } from "@/lib/useRegister";
import { C, Shell, fmtDateTime } from "./theme";

type Answers = Record<string, string>;

const FIELDS = [
  { id: "8bee7he", label: "Name", type: "text", required: true },
  { id: "248eb023", label: "Registration No", type: "text", required: true },
  { id: "eb04e221", label: "College Email", type: "email", required: true },
  { id: "db47b8f5", label: "Team Name", type: "text", required: true },
  { id: "b27ada53", label: "Member 1 Reg No", type: "text", required: false },
  { id: "f6aa53c1", label: "Member 2 Reg No", type: "text", required: false },
] as const;

export default function CaptureTheGhostRegister({ event }: { event: EventDoc }) {
  const { user, ready, submitting, error, signIn, submit, prefill, registration, loaded } =
    useRegister(event.slug);
  const [answers, setAnswers] = useState<Answers>({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (registration) setAnswers(registration.answers as Answers);
    else if (Object.keys(prefill).length > 0)
      setAnswers((prev) => ({ ...(prefill as Answers), ...prev }));
  }, [prefill, registration]);

  const set = (id: string, v: string) =>
    setAnswers((prev) => ({ ...prev, [id]: v }));

  const editing = !!registration && event.allowEdit;
  const deadline = event.registrationDeadline
    ? fmtDateTime(event.registrationDeadline)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(answers);
  }

  const shell = (children: React.ReactNode) => (
    <Shell>
      <div
        className="w-full max-w-2xl border p-7 sm:p-11"
        style={{ backgroundColor: C.panel, borderColor: C.line }}
      >
        {children}
      </div>
    </Shell>
  );

  const heading = (
    <div className="mb-9">
      <p
        className="text-xs font-bold uppercase tracking-[0.3em]"
        style={{ color: C.accent }}
      >
        Halloween CTF
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
        {event.title}
      </h1>
      {deadline && (
        <p className="mt-3 text-sm" style={{ color: C.muted }}>
          Registration closes {deadline}
        </p>
      )}
    </div>
  );

  if (!ready || (user && !loaded))
    return shell(
      <div className="flex flex-col gap-5">
        <div className="h-8 w-2/3 animate-pulse" style={{ backgroundColor: C.line }} />
        <div className="h-11 w-full animate-pulse" style={{ backgroundColor: C.line }} />
        <div className="h-11 w-full animate-pulse" style={{ backgroundColor: C.line }} />
        <div className="h-11 w-full animate-pulse" style={{ backgroundColor: C.line }} />
      </div>,
    );

  if (!user)
    return shell(
      <>
        {heading}
        <p className="mb-6 text-base" style={{ color: C.muted }}>
          Sign in with Google to register.
        </p>
        <button
          onClick={signIn}
          className="px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors"
          style={{ backgroundColor: C.accent, color: C.bg }}
        >
          Sign in with Google
        </button>
      </>,
    );

  if (!isRegistrationOpen(event))
    return shell(
      <>
        {heading}
        <p className="text-base font-bold" style={{ color: C.danger }}>
          Registrations are closed.
        </p>
      </>,
    );

  if (registration && !event.allowEdit)
    return shell(
      <>
        {heading}
        <p className="mb-6 text-base" style={{ color: C.muted }}>
          You&apos;re already registered for this event.
        </p>
        <Link
          href={`/events/${event.slug}`}
          className="inline-block border px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors"
          style={{ borderColor: C.accent, color: C.accent }}
        >
          Back to event
        </Link>
      </>,
    );

  return shell(
    <>
      {heading}

      <button
        type="button"
        onClick={() => setShowDetails((s) => !s)}
        className="mb-7 flex w-full items-center justify-between border px-4 py-3 text-left text-sm font-bold transition-colors"
        style={{ borderColor: C.line, color: C.text }}
      >
        {showDetails ? "Hide event details" : "Show event details"}
        <span style={{ color: C.accent }}>{showDetails ? "[-]" : "[+]"}</span>
      </button>
      {showDetails && event.description && (
        <div
          className="mb-8 border p-5"
          style={{ borderColor: C.line, backgroundColor: C.bg }}
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

      {editing && (
        <p
          className="mb-7 border px-4 py-3 text-sm"
          style={{ borderColor: C.accent, color: C.gold }}
        >
          You&apos;re registered. Update your answers below.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.id} className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>
                {f.label}
                {f.required && <span className="ml-1" style={{ color: C.danger }}>*</span>}
              </span>
              <input
                type={f.type}
                required={f.required}
                value={answers[f.id] ?? ""}
                onChange={(e) => set(f.id, e.target.value)}
                className="w-full border px-4 py-2.5 text-base outline-none transition-colors focus:border-[#FF7A18]"
                style={{
                  backgroundColor: C.bg,
                  borderColor: C.line,
                  color: C.text,
                }}
              />
            </label>
          ))}
        </div>

        {error && (
          <p className="text-sm font-bold" style={{ color: C.danger }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 self-start px-8 py-3.5 text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: C.accent, color: C.bg }}
        >
          {submitting ? "Submitting..." : editing ? "Update entry" : "Register"}
        </button>
      </form>
    </>,
  );
}
