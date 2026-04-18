import { z } from "zod";

export const inquirySchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

