"use client";

import { useState } from "react";
import type { EventDoc } from "@/lib/event-types";
import { useRegister } from "@/lib/useRegister";
import FieldRenderer from "./fields/FieldRenderer";

type Answers = Record<string, string | string[]>;

export default function DynamicForm({ event }: { event: EventDoc }) {
  const accent = event.theme?.accent ?? "#8D7FB5";
  const split = event.theme?.layout === "split";
  const banner = event.theme?.banner ?? event.bannerUrl;

  const { user, ready, submitting, error, signIn, submit } = useRegister(event.slug);
  const [answers, setAnswers] = useState<Answers>({});

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(answers);
  }

  const form = (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div>
        <h1 className="font-bebas text-4xl leading-none text-black">
          {event.title}
        </h1>
        {event.description && (
          <p className="mt-2 font-poppins text-sm text-black/60">
            {event.description}
          </p>
        )}
      </div>

      {event.fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={answers[field.id] ?? (field.type === "checkbox" ? [] : "")}
          onChange={(v) => setAnswer(field.id, v)}
          accent={accent}
        />
      ))}

      {error && <p className="font-poppins text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-full px-6 py-3 font-poppins text-sm font-bold text-white disabled:opacity-60"
        style={{ backgroundColor: accent }}
      >
        {submitting ? "Submitting…" : "Submit registration"}
      </button>
    </form>
  );

  const signInGate = (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="font-bebas text-4xl text-black">{event.title}</h1>
      <p className="font-poppins text-sm text-black/60">
        Sign in with Google to register.
      </p>
      <button
        onClick={signIn}
        className="rounded-full px-6 py-3 font-poppins text-sm font-bold text-white"
        style={{ backgroundColor: accent }}
      >
        Sign in with Google
      </button>
    </div>
  );

  const content = !ready ? (
    <p className="font-poppins text-sm text-black/40">Loading…</p>
  ) : user ? (
    form
  ) : (
    signInGate
  );

  if (split && banner) {
    return (
      <main className="flex min-h-screen flex-col lg:flex-row">
        <div
          className="h-48 w-full bg-cover bg-center lg:h-auto lg:w-1/2"
          style={{ backgroundImage: `url(${banner})` }}
        />
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-md">{content}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md">
        {banner && (
          <div
            className="mb-8 h-40 w-full rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${banner})` }}
          />
        )}
        {content}
      </div>
    </main>
  );
}
