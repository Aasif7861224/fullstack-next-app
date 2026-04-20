import { NextResponse } from "next/server";
import { normalizeError, serializeErrorForLog } from "@/utils/errors";

export function ok(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message, status = 400, details = null) {
  return NextResponse.json({ success: false, message, details }, { status });
}

export function handleError(err, context = "API request failed") {
  const normalized = normalizeError(err);
  console.error(`[${context}]`, serializeErrorForLog(err, normalized));
  return fail(normalized.message, normalized.statusCode, normalized.details);
}
