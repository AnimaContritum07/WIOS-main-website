import { z } from "zod";

const schema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  UPLOADTHING_TOKEN: z.string().min(1),
  COLLEGE_EMAIL_DOMAIN: z.string().min(1).default("vitapstudent.ac.in"),
  ADMIN_API_KEY: z.string().optional(), // dev only
});

let cached: z.infer<typeof schema> | undefined;

// Lazy so `next build` does not fail when env vars are missing.
export function getEnv() {
  return (cached ??= schema.parse(process.env));
}
