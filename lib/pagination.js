import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "@/lib/constants";

export function parsePagination(searchParams) {
  const page = Math.max(Number.parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10), 1);
  const limit = Math.min(
    Math.max(Number.parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10), 1),
    MAX_LIMIT
  );
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

