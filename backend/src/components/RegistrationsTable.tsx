"use client";

import { useCallback, useEffect, useState } from "react";
import type { EventDoc, Registration } from "@/lib/event-types";
import { currentIdToken, onAuthChange } from "@/lib/firebase-client";
import { SkeletonRows } from "./Skeleton";

export default function RegistrationsTable({ event }: { event: EventDoc }) {
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const token = await currentIdToken();
    if (!token) {
      setError("Sign in as admin to view registrations.");
      return;
    }
    const res = await fetch(`/api/events/${event.slug}/registrations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "failed to load");
      return;
    }
    setRows(data.registrations);
  }, [event.slug]);

  useEffect(() => onAuthChange(() => void load()), [load]);

  async function exportXlsx() {
    const token = await currentIdToken();
    if (!token) return;
    const res = await fetch(`/api/events/${event.slug}/registrations/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-registrations.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-bebas text-4xl text-black">
          {event.title} registrations
        </h1>
        <button
          onClick={exportXlsx}
          className="rounded-full bg-[#8D7FB5] px-5 py-2.5 font-poppins text-sm font-bold text-white"
        >
          Export .xlsx
        </button>
      </div>

      {error && <p className="font-poppins text-sm text-red-500">{error}</p>}

      {!rows && !error && <SkeletonRows rows={5} />}

      {rows && (
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full font-poppins text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                {event.fields.map((f) => (
                  <th key={f.id} className="px-3 py-2">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.uid} className="border-t border-black/5">
                  <td className="px-3 py-2">{r.name ?? "-"}</td>
                  <td className="px-3 py-2">{r.email}</td>
                  {event.fields.map((f) => {
                    const v = r.answers[f.id];
                    return (
                      <td key={f.id} className="px-3 py-2">
                        {Array.isArray(v) ? v.join(", ") : (v ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-black/40" colSpan={event.fields.length + 2}>
                    No registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
