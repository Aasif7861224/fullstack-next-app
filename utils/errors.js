import { ZodError } from "zod";

export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isAppError(err) {
  return err instanceof AppError;
}

function normalizeValidationDetails(err) {
  return Object.fromEntries(
    Object.entries(err.errors || {}).map(([field, value]) => [
      field,
      value?.message || "Invalid value",
    ])
  );
}

export function normalizeError(err) {
  if (err instanceof ZodError) {
    return new AppError(400, "Validation failed", err.flatten());
  }

  if (isAppError(err)) {
    return err;
  }

  if (err?.code === 11000) {
    const duplicateFields = Object.keys(err.keyPattern || err.keyValue || {});
    const message = duplicateFields.length
      ? `${duplicateFields.join(", ")} already exists`
      : "Duplicate value already exists";
    return new AppError(409, message, {
      duplicateFields,
      keyValue: err.keyValue || null,
    });
  }

  if (err?.name === "ValidationError") {
    return new AppError(400, "Validation failed", {
      fieldErrors: normalizeValidationDetails(err),
    });
  }

  if (err?.name === "CastError" || err?.name === "BSONError") {
    const field = err?.path || "id";
    return new AppError(400, `Invalid ${field}`);
  }

  if (err instanceof SyntaxError && /JSON/i.test(err.message || "")) {
    return new AppError(400, "Invalid JSON request body");
  }

  if (
    err?.name === "MongoServerSelectionError" ||
    err?.name === "MongooseServerSelectionError" ||
    /ECONNREFUSED|Server selection timed out/i.test(err?.message || "")
  ) {
    return new AppError(503, "Database connection failed");
  }

  return new AppError(500, "Internal server error");
}

export function serializeErrorForLog(err, fallbackError = null) {
  const normalized = fallbackError || normalizeError(err);

  return {
    name: err?.name || normalized.name,
    message: err?.message || normalized.message,
    normalizedMessage: normalized.message,
    statusCode: normalized.statusCode,
    code: err?.code || null,
    details: normalized.details || null,
    stack: err?.stack || null,
  };
}
