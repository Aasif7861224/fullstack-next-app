import { createFeatureOrderController } from "@/controllers/paymentController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    return await createFeatureOrderController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

