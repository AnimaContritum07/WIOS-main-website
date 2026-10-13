"use client";

import { useCallback, useEffect, useState } from "react";
import { currentIdToken, onAuthChange } from "@/lib/firebase-client";
import { SkeletonRows } from "./Skeleton";

type AdminEntry = { email: string; source: "env" | "added" };

export default function AdminsPanel() {
  const [admins, setAdmins] = useState<AdminEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const token = await currentIdToken();
    if (!token) {
      setError("Sign in as admin to manage admins.");
      return;
    }
    const res = await fetch("/api/admin/admins", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "failed to load");
      return;
    }
    setAdmins(data.admins);
  }, []);

  useEffect(() => onAuthChange(() => void load()), [load]);

  async function add() {
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const token = await currentIdToken();
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "failed to add");
      return;
    }
    setEmail("");
    void load();
  }

  async function remove(target: string) {
    if (!confirm(`Remove admin ${target}?`)) return;
    const token = await currentIdToken();
    const res = await fetch(`/api/admin/admins/${encodeURIComponent(target)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "failed to remove");
      return;
    }
    void load();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-8">
      <h2 className="font-bebas text-3xl text-black">Admins</h2>
      <p className="font-poppins text-xs text-black/50">
        These emails get admin access on sign-in. Env admins cannot be removed here.
      </p>

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="new-admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-black/10 px-3 py-2 font-poppins text-sm outline-none focus:border-[#8D7FB5]"
        />
        <button
          onClick={add}
          disabled={busy}
          className="rounded-full bg-[#8D7FB5] px-5 py-2.5 font-poppins text-sm font-bold text-white disabled:opacity-60"
        >
          Add admin
        </button>
      </div>

      {error && <p className="font-poppins text-sm text-red-500">{error}</p>}

      {!admins && !error && <SkeletonRows rows={2} />}

      {admins?.map((a) => (
        <div
          key={a.email}
          className="flex items-center gap-3 rounded-xl border border-black/10 p-4"
        >
          <span className="flex-1 font-poppins text-sm text-black">{a.email}</span>
          <span className="rounded-full bg-black/5 px-2 py-0.5 font-poppins text-xs text-black/50">
            {a.source}
          </span>
          {a.source === "added" && (
            <button
              onClick={() => remove(a.email)}
              className="font-poppins text-xs font-bold text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
