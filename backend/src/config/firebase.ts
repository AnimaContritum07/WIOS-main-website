import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import {
  getFirestore,
  type Firestore,
} from "firebase-admin/firestore";

let app: App | undefined;

function getAdminApp(): App {
  if (app) return app;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin environment variables. Check .env.local."
    );
  }

  app =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

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
