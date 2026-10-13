import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/config/firebase";
import { adminEmails as envAdminEmails } from "@/config/admins";

function key(email: string): string {
  return email.trim().toLowerCase();
}

export async function isDbAdminEmail(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const snap = await db.collection("adminEmails").doc(key(email)).get();
  return snap.exists;
}

export interface AdminEntry {
  email: string;
  source: "env" | "added";
}

export async function listAdminEmails(): Promise<AdminEntry[]> {
  const snap = await db.collection("adminEmails").get();
  const env = new Set(envAdminEmails());
  const entries = new Map<string, AdminEntry>();
  for (const e of env) entries.set(e, { email: e, source: "env" });
  for (const d of snap.docs) {
    const e = key(d.get("email") ?? d.id);
    if (!entries.has(e)) entries.set(e, { email: e, source: "added" });
  }
  return [...entries.values()];
}

export async function addAdminEmail(email: string, addedBy: string): Promise<void> {
  const e = key(email);
  await db.collection("adminEmails").doc(e).set({
    email: e,
    addedBy,
    addedAt: Timestamp.now(),
  });
}

export async function removeAdminEmail(email: string): Promise<void> {
  await db.collection("adminEmails").doc(key(email)).delete();
}
