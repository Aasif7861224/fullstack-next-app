import { verifyFeaturePaymentController } from "@/controllers/paymentController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    return await verifyFeaturePaymentController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

