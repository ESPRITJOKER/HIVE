import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiResult } from "@/types/domain";

/** Consistent success envelope for all route handlers. */
export function apiOk<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiResult<T> = { ok: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(body, { status });
}

/** Consistent failure envelope — never include secrets or stack traces. */
export function apiFail(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const body: ApiResult<never> = {
    ok: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
  return NextResponse.json(body, { status });
}

/** Maps thrown validation / unknown errors to a safe response. */
export function apiErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return apiFail(400, "VALIDATION_ERROR", "Invalid input.", error.flatten());
  }
  // Log server-side only; never echo the raw error to the client.
  console.error("[HIVE API] Unhandled error:", error instanceof Error ? error.message : "unknown");
  return apiFail(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}
