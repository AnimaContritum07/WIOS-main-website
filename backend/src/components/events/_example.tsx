"use client";

// Example fully custom register page. Copy, rename to <slug>.tsx,
// register it in registry.ts. Full code freedom — any UI you want.

import { useState } from "react";
import type { EventDoc } from "@/lib/event-types";
import { useRegister } from "@/lib/useRegister";

export default function ExampleEventForm({ event }: { event: EventDoc }) {
  const { user, ready, submitting, error, signIn, submit } = useRegister(event.slug);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");

  if (!ready) return <p className="p-10">Loading…</p>;

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-black text-white">
        <button onClick={signIn} className="rounded-full bg-white px-8 py-4 text-black">
          Sign in to join {event.title}
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-fuchsia-600 to-indigo-700 p-10 text-white">
      <h1 className="text-6xl font-black">{event.title}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          // answers keyed by your own ids — anything goes
          submit({ reg_number: name, team_name: team });
        }}
        className="mt-10 flex max-w-md flex-col gap-4"
      >
        <input
          className="rounded-xl bg-white/15 px-4 py-3 placeholder-white/60 outline-none"
          placeholder="Registration number"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-xl bg-white/15 px-4 py-3 placeholder-white/60 outline-none"
          placeholder="Team name"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
        {error && <p className="text-red-200">{error}</p>}
        <button
          disabled={submitting}
          className="rounded-full bg-white px-6 py-3 font-bold text-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Joining…" : "Join"}
        </button>
      </form>
    </main>
  );
}
