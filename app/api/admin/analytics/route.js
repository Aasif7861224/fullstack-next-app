import { analyticsController } from "@/controllers/adminController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await analyticsController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

