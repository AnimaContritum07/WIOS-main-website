import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type Credential,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;

function credential(): Credential {
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    const json = JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8"));
    return cert(json);
  }

  // Whole service-account JSON as one env var (easiest on Vercel)
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    return cert(JSON.parse(raw));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }

  throw new Error(
    "Missing Firebase Admin credentials: set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.",
  );
}

function getAdminApp(): App {
  if (app) return app;
  app = getApps()[0] ?? initializeApp({ credential: credential() });
  return app;
}

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getFirestore(getAdminApp());
    const value = instance[prop as keyof Firestore];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuth(getAdminApp());
    const value = instance[prop as keyof Auth];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
