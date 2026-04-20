import { getAuthUserFromRequest } from "@/lib/auth";
import { createFeatureOrder, verifyFeaturePayment } from "@/services/paymentService";
import { createFeatureOrderSchema, verifyFeaturePaymentSchema } from "@/validators/paymentValidator";
import { readJsonBody } from "@/utils/request";

export async function createFeatureOrderController(request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const body = await readJsonBody(request);
  const payload = createFeatureOrderSchema.parse(body);
  const data = await createFeatureOrder(payload, user);
  return responseBuilder(data, 201);
}

export async function verifyFeaturePaymentController(request, responseBuilder) {
  const body = await readJsonBody(request);
  const payload = verifyFeaturePaymentSchema.parse(body);
  const data = await verifyFeaturePayment(payload);
  return responseBuilder(data);
}
