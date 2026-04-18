import { getAuthUserFromRequest, requireRole } from "@/lib/auth";
import { ROLE } from "@/lib/constants";
import { parsePagination } from "@/lib/pagination";
import {
  createSellerFeedback,
  getSellerAnalytics,
  listSellerFeedback,
} from "@/services/sellerService";
import { sellerFeedbackCreateSchema } from "@/validators/sellerValidator";

async function requireSeller(request) {
  const user = await getAuthUserFromRequest(request);
  requireRole(user, [ROLE.OWNER]);
  return user;
}

export async function sellerAnalyticsController(request, responseBuilder) {
  const user = await requireSeller(request);
  const data = await getSellerAnalytics(user);
  return responseBuilder(data);
}

export async function createSellerFeedbackController(request, responseBuilder) {
  const user = await requireSeller(request);
  const body = await request.json();
  const payload = sellerFeedbackCreateSchema.parse(body);
  const feedback = await createSellerFeedback(user, payload);
  return responseBuilder(feedback, 201);
}

export async function listSellerFeedbackController(request, responseBuilder) {
  const user = await requireSeller(request);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") || "all";
  const data = await listSellerFeedback(user, { page, limit, skip, status });
  return responseBuilder(data);
}
