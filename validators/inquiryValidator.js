import { z } from "zod";

export const inquirySchema = z.object({
  propertyId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(5),
});
