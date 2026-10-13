"use client";

import type { FormField } from "@/lib/event-types";

type Value = string | string[];

interface Props {
  field: FormField;
  value: Value;
  onChange: (value: Value) => void;
  accent: string;
}

const inputBase =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 font-poppins text-sm text-black outline-none focus:border-[var(--accent)]";

export default function FieldRenderer({ field, value, onChange, accent }: Props) {
  const style = { ["--accent" as string]: accent } as React.CSSProperties;
  const str = Array.isArray(value) ? "" : value;

  function renderControl() {
    switch (field.type) {
      case "long_text":
        return (
          <textarea
            className={`${inputBase} min-h-28`}
            style={style}
            value={str}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "select":
        return (
          <select
            className={inputBase}
            style={style}
            value={str}
            required={field.required}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select…</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="flex flex-col gap-2">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2 font-poppins text-sm">
                <input
                  type="radio"
                  name={field.id}
                  checked={str === opt}
                  required={field.required}
                  onChange={() => onChange(opt)}
                  style={{ accentColor: accent }}
                />
                {opt}
              </label>
            ))}
          </div>
        );

      case "checkbox": {
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-col gap-2">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2 font-poppins text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, opt]
                        : selected.filter((o) => o !== opt),
                    )
                  }
                  style={{ accentColor: accent }}
                />
                {opt}
              </label>
            ))}
          </div>
        );
      }

      default: {
        const typeMap: Record<string, string> = {
          short_text: "text",
          email: "email",
          number: "number",
          date: "date",
          time: "time",
          phone: "tel",
          url: "url",
        };
        return (
          <input
            type={typeMap[field.type] ?? "text"}
            className={inputBase}
            style={style}
            value={str}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      }
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-poppins text-sm font-semibold text-black">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {field.helpText && (
        <p className="font-poppins text-xs text-black/50">{field.helpText}</p>
      )}
      {renderControl()}
    </div>
  );
}
