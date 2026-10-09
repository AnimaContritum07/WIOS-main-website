import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getEnv } from "@/config/env";

function ensureApp() {
  if (!getApps().length) {
    const env = getEnv();
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
}

export function getDb(): Firestore {
  ensureApp();
  return getFirestore();
}

export function getAdminAuth(): Auth {
  ensureApp();
  return getAuth();
}

// `db.collection(...)` works everywhere, but Firebase only initializes on first use.
export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
