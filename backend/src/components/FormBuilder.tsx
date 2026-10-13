"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FIELD_TYPES,
  FIELD_LABELS,
  OPTION_TYPES,
  type FieldType,
  type FormField,
} from "@/lib/event-types";
import { currentIdToken } from "@/lib/firebase-client";

function newField(): FormField {
  return {
    id: crypto.randomUUID().slice(0, 8),
    type: "short_text",
    label: "",
    required: false,
    options: [],
  };
}

const input =
  "rounded-lg border border-black/10 px-3 py-2 font-poppins text-sm outline-none focus:border-[#8D7FB5]";

export default function FormBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [accent, setAccent] = useState("#8D7FB5");
  const [banner, setBanner] = useState("");
  const [layout, setLayout] = useState("centered");
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patchField(i: number, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function move(i: number, dir: -1 | 1) {
    setFields((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const token = await currentIdToken();
      if (!token) throw new Error("sign in as admin first");
      const body = {
        title,
        description,
        status,
        theme: { accent, layout, ...(banner ? { banner } : {}) },
        fields: fields.map((f) => ({
          ...f,
          options: OPTION_TYPES.includes(f.type) ? f.options : undefined,
        })),
      };
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed to create event");
      router.push(`/${data.event.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to create event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-12">
      <h1 className="font-bebas text-4xl text-black">Create event</h1>

      <div className="flex flex-col gap-3">
        <input
          className={input}
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={input}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            className={input}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className={input}
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
          >
            <option value="centered">Centered layout</option>
            <option value="split">Split layout</option>
          </select>
          <label className="flex items-center gap-2 font-poppins text-sm">
            Accent
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
            />
          </label>
          <input
            className={input}
            placeholder="Banner image URL"
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-poppins text-sm font-bold text-black/70">Fields</h2>
        {fields.map((field, i) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-xl border border-black/10 p-4">
            <div className="flex gap-2">
              <input
                className={`${input} flex-1`}
                placeholder="Question label"
                value={field.label}
                onChange={(e) => patchField(i, { label: e.target.value })}
              />
              <select
                className={input}
                value={field.type}
                onChange={(e) => patchField(i, { type: e.target.value as FieldType })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {FIELD_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <input
              className={`${input} font-mono text-xs`}
              placeholder="field id (used in code / export)"
              value={field.id}
              onChange={(e) =>
                patchField(i, { id: e.target.value.trim().replace(/\s+/g, "_") })
              }
            />

            {OPTION_TYPES.includes(field.type) && (
              <input
                className={input}
                placeholder="Options (comma separated)"
                value={field.options?.join(", ") ?? ""}
                onChange={(e) =>
                  patchField(i, {
                    options: e.target.value
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean),
                  })
                }
              />
            )}

            <div className="flex items-center gap-4 font-poppins text-xs">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => patchField(i, { required: e.target.checked })}
                />
                Required
              </label>
              <button type="button" onClick={() => move(i, -1)} className="text-black/50">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} className="text-black/50">
                ↓
              </button>
              <button
                type="button"
                onClick={() => setFields((p) => p.filter((_, idx) => idx !== i))}
                className="ml-auto text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setFields((p) => [...p, newField()])}
          className="self-start rounded-full border border-black/15 px-4 py-2 font-poppins text-sm font-bold text-black"
        >
          + Add field
        </button>
      </div>

      {error && <p className="font-poppins text-sm text-red-500">{error}</p>}

      <button
        onClick={save}
        disabled={saving || !title}
        className="self-start rounded-full bg-[#8D7FB5] px-6 py-3 font-poppins text-sm font-bold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Create event"}
      </button>
    </div>
  );
}
