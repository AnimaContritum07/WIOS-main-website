"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { EventDoc, EventStatus } from "@/lib/event-types";
import { currentIdToken, onAuthChange } from "@/lib/firebase-client";

const STATUSES: EventStatus[] = ["draft", "open", "closed"];

export default function EventsAdminList() {
  const [events, setEvents] = useState<EventDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const token = await currentIdToken();
    if (!token) {
      setError("Sign in as admin to manage events.");
      return;
    }
    const res = await fetch("/api/admin/events", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "failed to load");
      return;
    }
    setEvents(data.events);
  }, []);

  useEffect(() => onAuthChange(() => void load()), [load]);

  async function setStatus(slug: string, status: EventStatus) {
    setBusy(slug);
    const token = await currentIdToken();
    await fetch(`/api/events/${slug}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    void load();
  }

  async function remove(slug: string) {
    if (!confirm(`Delete "${slug}" and all its registrations?`)) return;
    setBusy(slug);
    const token = await currentIdToken();
    await fetch(`/api/events/${slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBusy(null);
    void load();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-bebas text-4xl text-black">Manage events</h1>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-[#8D7FB5] px-5 py-2.5 font-poppins text-sm font-bold text-white"
        >
          + New event
        </Link>
      </div>

      {error && <p className="font-poppins text-sm text-red-500">{error}</p>}

      {events?.map((e) => (
        <div
          key={e.slug}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-black/10 p-4"
        >
          <div className="flex-1">
            <p className="font-poppins text-sm font-bold text-black">{e.title}</p>
            <p className="font-poppins text-xs text-black/40">
              /{e.slug} · {e.fields.length} fields
            </p>
          </div>

          <select
            className="rounded-lg border border-black/10 px-2 py-1 font-poppins text-xs"
            value={e.status}
            disabled={busy === e.slug}
            onChange={(ev) => setStatus(e.slug, ev.target.value as EventStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <Link
            href={`/admin/events/${e.slug}/edit`}
            className="rounded-full border border-black/15 px-3 py-1.5 font-poppins text-xs font-bold"
          >
            Edit
          </Link>
          <Link
            href={`/${e.slug}/register/users`}
            className="rounded-full border border-black/15 px-3 py-1.5 font-poppins text-xs font-bold"
          >
            Registrations
          </Link>
          <button
            onClick={() => remove(e.slug)}
            disabled={busy === e.slug}
            className="rounded-full px-3 py-1.5 font-poppins text-xs font-bold text-red-500"
          >
            Delete
          </button>
        </div>
      ))}

      {events?.length === 0 && (
        <p className="font-poppins text-sm text-black/40">No events yet.</p>
      )}
    </div>
  );
}
