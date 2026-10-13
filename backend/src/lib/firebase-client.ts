// Browser-only helpers for Google sign-in. Import from client components only.
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

function app() {
  return getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
}

// Google popup -> Firebase ID token
export async function signInWithGoogle(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(getAuth(app()), provider);
  return result.user.getIdToken();
}

export async function signOutUser() {
  await signOut(getAuth(app()));
}

// Current user's fresh ID token or null
export async function currentIdToken(): Promise<string | null> {
  const user = getAuth(app()).currentUser;
  return user ? user.getIdToken() : null;
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(getAuth(app()), cb);
}
