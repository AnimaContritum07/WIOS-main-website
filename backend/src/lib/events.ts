import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "@/config/firebase";
import { slugify } from "./slugify";
import { HttpError } from "./http";
import type { UserProfile } from "./auth";
import {
  FIELD_TYPES,
  OPTION_TYPES,
  type FormField,
  type EventDoc,
  type Registration,
} from "./event-types";

export * from "./event-types";

const fieldSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(FIELD_TYPES),
    label: z.string().min(1),
    required: z.boolean(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    options: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (f) => !OPTION_TYPES.includes(f.type) || (f.options && f.options.length > 0),
    { message: "options required for select/radio/checkbox" },
  );

const themeSchema = z.object({
  accent: z.string().min(1).default("#8D7FB5"),
  banner: z.string().url().optional(),
  layout: z.enum(["centered", "split"]).default("centered"),
});

export const eventInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  bannerUrl: z.string().url().optional(),
  location: z.string().optional(),
  startsAt: z.string().optional(),
  status: z.enum(["draft", "open", "closed"]).default("draft"),
  theme: themeSchema.default({ accent: "#8D7FB5", layout: "centered" }),
  fields: z.array(fieldSchema).default([]),
});

export const eventPatchSchema = eventInputSchema.partial();

export const registrationInputSchema = z.object({
  answers: z.record(z.union([z.string(), z.array(z.string())])).default({}),
});

export type EventInput = z.infer<typeof eventInputSchema>;

// Enforce answers against field schema
export function validateAnswers(
  fields: FormField[],
  answers: Record<string, string | string[]>,
): Record<string, string | string[]> {
  const clean: Record<string, string | string[]> = {};
  for (const field of fields) {
    const value = answers[field.id];
    const empty =
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (empty) {
      if (field.required)
        throw new HttpError(400, `missing required field: ${field.label}`);
      continue;
    }

    if (field.type === "checkbox") {
      const arr = Array.isArray(value) ? value : [value];
      for (const v of arr)
        if (!field.options?.includes(v))
          throw new HttpError(400, `invalid option for ${field.label}`);
      clean[field.id] = arr;
      continue;
    }

    if (Array.isArray(value))
      throw new HttpError(400, `invalid value for ${field.label}`);

    if (OPTION_TYPES.includes(field.type) && !field.options?.includes(value))
      throw new HttpError(400, `invalid option for ${field.label}`);

    clean[field.id] = value;
  }
  return clean;
}

function toIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

function serializeEvent(id: string, data: FirebaseFirestore.DocumentData): EventDoc {
  return {
    slug: id,
    title: data.title ?? "",
    description: data.description ?? "",
    bannerUrl: data.bannerUrl,
    location: data.location,
    startsAt: data.startsAt,
    status: data.status ?? "draft",
    theme: data.theme ?? { accent: "#8D7FB5", layout: "centered" },
    fields: data.fields ?? [],
    createdBy: data.createdBy ?? "",
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function serializeRegistration(
  id: string,
  data: FirebaseFirestore.DocumentData,
): Registration {
  return {
    uid: id,
    email: data.email ?? "",
    name: data.name ?? null,
    photoURL: data.photoURL ?? null,
    answers: data.answers ?? {},
    createdAt: toIso(data.createdAt),
  };
}

export async function listEvents(publicOnly: boolean): Promise<EventDoc[]> {
  const snap = await db.collection("events").get();
  const events = snap.docs.map((d) => serializeEvent(d.id, d.data()));
  return publicOnly ? events.filter((e) => e.status !== "draft") : events;
}

export async function getEvent(slug: string): Promise<EventDoc | null> {
  const snap = await db.collection("events").doc(slug).get();
  return snap.exists ? serializeEvent(snap.id, snap.data()!) : null;
}

export async function createEvent(
  input: EventInput,
  uid: string,
): Promise<EventDoc> {
  const slug = slugify(input.title);
  if (!slug) throw new HttpError(400, "invalid title");

  const ref = db.collection("events").doc(slug);
  if ((await ref.get()).exists)
    throw new HttpError(409, "event with this name already exists");

  const now = Timestamp.now();
  await ref.set({ ...input, slug, createdBy: uid, createdAt: now, updatedAt: now });
  return (await getEvent(slug))!;
}

export async function updateEvent(
  slug: string,
  patch: Partial<EventInput>,
): Promise<EventDoc> {
  const ref = db.collection("events").doc(slug);
  if (!(await ref.get()).exists) throw new HttpError(404, "event not found");
  await ref.set({ ...patch, updatedAt: Timestamp.now() }, { merge: true });
  return (await getEvent(slug))!;
}

export async function deleteEvent(slug: string): Promise<void> {
  await db.recursiveDelete(db.collection("events").doc(slug));
}

export async function upsertRegistration(
  slug: string,
  user: UserProfile,
  answers: Record<string, string | string[]>,
): Promise<{ created: boolean }> {
  const ref = db.collection("events").doc(slug).collection("registrations").doc(user.uid);
  const existing = await ref.get();
  if (existing.exists) return { created: false };

  await ref.set({
    uid: user.uid,
    email: user.email,
    name: user.name,
    photoURL: user.photoURL,
    answers,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { created: true };
}

export async function getRegistration(
  slug: string,
  uid: string,
): Promise<Registration | null> {
  const snap = await db
    .collection("events")
    .doc(slug)
    .collection("registrations")
    .doc(uid)
    .get();
  return snap.exists ? serializeRegistration(snap.id, snap.data()!) : null;
}

export async function listRegistrations(slug: string): Promise<Registration[]> {
  const snap = await db
    .collection("events")
    .doc(slug)
    .collection("registrations")
    .get();
  return snap.docs.map((d) => serializeRegistration(d.id, d.data()));
}

export async function deleteRegistration(slug: string, uid: string): Promise<void> {
  await db
    .collection("events")
    .doc(slug)
    .collection("registrations")
    .doc(uid)
    .delete();
}
