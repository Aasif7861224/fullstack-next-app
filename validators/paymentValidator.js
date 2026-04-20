import { z } from "zod";

export const createFeatureOrderSchema = z.object({
  propertyId: z.string().trim().min(1),
  amount: z.coerce.number().positive().optional(),
  currency: z.string().trim().length(3).optional(),
});

export const verifyFeaturePaymentSchema = z.object({
  orderId: z.string().trim().min(1),
  paymentId: z.string().trim().min(1),
});
