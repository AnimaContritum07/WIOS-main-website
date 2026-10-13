import type { ComponentType } from "react";
import type { EventDoc } from "@/lib/event-types";

export type EventFormComponent = ComponentType<{ event: EventDoc }>;

// slug -> custom register UI (full freedom)
// Copy _example.tsx, then:
//   import HackathonForm from "./hackathon";
//   export const EVENT_OVERRIDES = { hackathon: HackathonForm };
export const EVENT_OVERRIDES: Record<string, EventFormComponent> = {};

export function getOverride(slug: string): EventFormComponent | null {
  return EVENT_OVERRIDES[slug] ?? null;
}
