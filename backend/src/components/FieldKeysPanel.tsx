"use client";

import { useCallback, useEffect, useState } from "react";
import { FIELD_LABELS, type FieldLibraryItem } from "@/lib/event-types";
import { currentIdToken, onAuthChange } from "@/lib/firebase-client";
import { SkeletonRows } from "./Skeleton";

export default function FieldKeysPanel() {
  const [keys, setKeys] = useState<FieldLibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const token = await currentIdToken();
    if (!token) {
      setError("Sign in as admin to manage field keys.");
      return;
    }
    const res = await fetch("/api/admin/fields", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "failed to load");
      return;
    }
    setKeys(data.fields);
  }, []);

  useEffect(() => onAuthChange(() => void load()), [load]);

  async function rename(globalId: string, label: string) {
    setSaving(globalId);
    const token = await currentIdToken();
    await fetch(`/api/admin/fields/${globalId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ label }),
    });
    setSaving(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-8">
      <h2 className="font-bebas text-3xl text-black">Field keys</h2>
      <p className="font-poppins text-xs text-black/50">
        Reusable fields shared across events. Rename a label to change the default
        when reusing it.
      </p>

      {error && <p className="font-poppins text-sm text-red-500">{error}</p>}

      {!keys && !error && <SkeletonRows rows={3} />}

      {keys?.map((k) => (
        <div
          key={k.globalId}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-black/10 p-4"
        >
          <input
            defaultValue={k.label}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== k.label) void rename(k.globalId, v);
            }}
            className="flex-1 rounded-lg border border-black/10 px-3 py-2 font-poppins text-sm outline-none focus:border-[#8D7FB5]"
          />
          <span className="font-poppins text-xs text-black/50">
            {FIELD_LABELS[k.type]}
          </span>
          <span className="font-poppins text-xs text-black/40">
            used in {k.usedIn}
          </span>
          <span className="font-mono text-[10px] text-black/30">{k.globalId}</span>
          {saving === k.globalId && (
            <span className="font-poppins text-xs text-[#8D7FB5]">saving...</span>
          )}
        </div>
      ))}

      {keys?.length === 0 && (
        <p className="font-poppins text-sm text-black/40">No field keys yet.</p>
      )}
    </div>
  );
}
