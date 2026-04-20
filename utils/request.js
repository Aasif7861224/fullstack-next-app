import { AppError } from "@/utils/errors";

export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AppError(400, "Invalid JSON request body");
    }
    throw error;
  }
}

export async function readFormBody(request) {
  try {
    return await request.formData();
  } catch (error) {
    throw new AppError(400, "Invalid form data");
  }
}

export function parseStringField(value, fieldName, { required = false, fallback = "" } = {}) {
  if (value === null || typeof value === "undefined") {
    if (required) {
      throw new AppError(400, `${fieldName} is required`);
    }
    return fallback;
  }

  const normalized = `${value}`.trim();
  if (!normalized) {
    if (required) {
      throw new AppError(400, `${fieldName} is required`);
    }
    return fallback;
  }

  return normalized;
}

export function parseOptionalNumber(
  value,
  fieldName,
  { integer = false, min = null, max = null } = {}
) {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }

  const normalized = `${value}`.trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new AppError(400, `${fieldName} must be a valid number`);
  }
  if (integer && !Number.isInteger(parsed)) {
    throw new AppError(400, `${fieldName} must be an integer`);
  }
  if (min !== null && parsed < min) {
    throw new AppError(400, `${fieldName} must be at least ${min}`);
  }
  if (max !== null && parsed > max) {
    throw new AppError(400, `${fieldName} must be at most ${max}`);
  }

  return parsed;
}

export function parseArrayField(value) {
  if (value === null || typeof value === "undefined") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }

  const normalized = `${value}`.trim();
  if (!normalized) {
    return [];
  }

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => `${item}`.trim()).filter(Boolean);
    }
  } catch {
    return normalized
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}
