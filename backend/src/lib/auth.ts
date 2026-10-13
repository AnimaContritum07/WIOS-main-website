import { Timestamp } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import { auth, db } from "@/config/firebase";
import { isAdminEmail } from "@/config/admins";
import { HttpError } from "./http";

export type Role = "user" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  role: Role;
}

export async function verifyBearer(req: Request): Promise<DecodedIdToken> {
  const match = (req.headers.get("authorization") ?? "").match(/^Bearer (.+)$/i);
  if (!match) throw new HttpError(401, "missing bearer token");
  try {
    return await auth.verifyIdToken(match[1].trim());
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("verifyIdToken failed:", detail);
    throw new HttpError(
      401,
      process.env.NODE_ENV === "development"
        ? `invalid or expired token: ${detail}`
        : "invalid or expired token",
    );
  }
}

// Verify token, upsert user
export async function ensureUser(req: Request): Promise<UserProfile> {
  const decoded = await verifyBearer(req);
  const uid = decoded.uid;
  const email = decoded.email ?? "";
  const name = decoded.name ?? null;
  const photoURL = decoded.picture ?? null;

  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();

  const storedRole = (snap.get("role") as Role | undefined) ?? "user";
  const role: Role = isAdminEmail(email) ? "admin" : storedRole;
  const now = Timestamp.now();

  if (!snap.exists) {
    await ref.set({ uid, email, name, photoURL, role, createdAt: now, updatedAt: now });
  } else {
    await ref.set({ email, name, photoURL, role, updatedAt: now }, { merge: true });
  }

  return { uid, email, name, photoURL, role };
}

export async function requireAdmin(req: Request): Promise<UserProfile> {
  const user = await ensureUser(req);
  if (user.role !== "admin") throw new HttpError(403, "admin access required");
  return user;
}
