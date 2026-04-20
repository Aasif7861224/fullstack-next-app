import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "@/lib/constants";

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(`${value ?? ""}`, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

export function parsePagination(searchParams) {
  const page = toPositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const limit = Math.min(toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return {
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}
