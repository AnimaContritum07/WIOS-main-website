// Shared theme for Capture the Ghost pages.

import type { ReactNode } from "react";
import { Space_Mono } from "next/font/google";

export const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });

export const C = {
  bg: "#1A0F08",
  panel: "#221409",
  line: "#3A2414",
  accent: "#FF7A18",
  gold: "#F2A900",
  text: "#F2E3C6",
  muted: "#C9A98A",
  danger: "#E24A1E",
};

export function Shell({
  children,
  center = true,
}: {
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={`${mono.className} ctg-scope`}
      style={{
        height: "100dvh",
        overflowY: "auto",
        backgroundColor: C.bg,
        color: C.text,
      }}
    >
      <style>{`
        .ctg-scope { scrollbar-width: thin; scrollbar-color: ${C.accent} ${C.bg}; }
        .ctg-scope::-webkit-scrollbar { width: 12px; }
        .ctg-scope::-webkit-scrollbar-track { background: ${C.bg}; }
        .ctg-scope::-webkit-scrollbar-thumb { background: ${C.accent}; border: 3px solid ${C.bg}; }
        .ctg-scope::-webkit-scrollbar-thumb:hover { background: ${C.gold}; }
      `}</style>
      <div
        className={`flex min-h-full justify-center px-4 py-14 ${
          center ? "items-center" : "items-start"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
