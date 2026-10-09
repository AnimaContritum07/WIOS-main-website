import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function notImplemented() {
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "invalid JSON body");
  }
}

function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json({ error: "validation_error", details: err.flatten() }, { status: 400 });
  }
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "internal_error" }, { status: 500 });
}

// Wrap every route handler: turns thrown errors (zod, HttpError) into JSON responses.
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      return handleError(err);
    }
  };
}
