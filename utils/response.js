import { NextResponse } from "next/server";
import { isAppError } from "@/utils/errors";
import { ZodError } from "zod";

export function ok(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message, status = 400, details = null) {
  return NextResponse.json({ success: false, message, details }, { status });
}

export function handleError(err) {
  if (err instanceof ZodError) {
    return fail("Validation failed", 400, err.flatten());
  }
  if (isAppError(err)) {
    return fail(err.message, err.statusCode, err.details);
  }
  console.error(err);
  return fail("Internal server error", 500);
}
