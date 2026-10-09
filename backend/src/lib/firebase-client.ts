// Browser-only helpers for Google sign-in. Import from client components only.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

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

// Opens the Google popup and returns a Firebase ID token to send as "Authorization: Bearer <token>".
// `hd` only hints Google to show college accounts; the backend does the real domain check.
export async function signInWithGoogle(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    hd: process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN ?? "",
    prompt: "select_account",
  });
  const result = await signInWithPopup(getAuth(app()), provider);
  return result.user.getIdToken();
}

export async function signOutUser() {
  await signOut(getAuth(app()));
}
