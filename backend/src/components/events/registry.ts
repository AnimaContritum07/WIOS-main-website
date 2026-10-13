import type { ComponentType } from "react";
import type { EventDoc } from "@/lib/event-types";

export type EventComponent = ComponentType<{ event: EventDoc }>;

// Pages you can override per event
export type EventSurface =
  | "details"
  | "register"
  | "success"
  | "alreadyRegistered";

// slug -> custom pages (full freedom)
// Copy _example.tsx, then:
//   import HackathonForm from "./hackathon";
//   export const EVENT_OVERRIDES = { hackathon: { register: HackathonForm } };
export const EVENT_OVERRIDES: Record<
  string,
  Partial<Record<EventSurface, EventComponent>>
> = {};

export function getOverride(
  slug: string,
  surface: EventSurface,
): EventComponent | null {
  return EVENT_OVERRIDES[slug]?.[surface] ?? null;
}
