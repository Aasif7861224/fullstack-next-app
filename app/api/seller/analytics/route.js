import { sellerAnalyticsController } from "@/controllers/sellerController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await sellerAnalyticsController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}
