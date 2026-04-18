import { getAuthUserFromRequest } from "@/lib/auth";
import { createFeatureOrder, verifyFeaturePayment } from "@/services/paymentService";

export async function createFeatureOrderController(request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const body = await request.json();
  const data = await createFeatureOrder(body, user);
  return responseBuilder(data, 201);
}

export async function verifyFeaturePaymentController(request, responseBuilder) {
  const body = await request.json();
  const data = await verifyFeaturePayment(body);
  return responseBuilder(data);
}

