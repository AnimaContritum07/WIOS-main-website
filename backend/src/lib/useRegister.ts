"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import {
  currentIdToken,
  onAuthChange,
  signInWithGoogle,
} from "@/lib/firebase-client";

type Answers = Record<string, string | string[]>;

// Auth + submit plumbing for custom register pages
export function useRegister(slug: string) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      onAuthChange((u) => {
        setUser(u);
        setReady(true);
      }),
    [],
  );

  async function signIn() {
    try {
      await signInWithGoogle();
    } catch {
      /* popup closed */
    }
  }

  async function submit(answers: Answers) {
    setSubmitting(true);
    setError(null);
    try {
      const token = await currentIdToken();
      if (!token) throw new Error("please sign in first");
      const res = await fetch(`/api/events/${slug}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });
      if (res.status === 409) {
        router.push(`/events/${slug}/register/already-registered`);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "registration failed");
      router.push(`/events/${slug}/register/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return { user, ready, submitting, error, signIn, submit };
}
