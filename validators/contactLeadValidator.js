import { z } from "zod";

export const contactLeadCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(3).max(140),
  message: z.string().trim().min(8).max(4000),
  sourcePage: z.string().trim().max(160).optional(),
});

export const contactLeadAdminUpdateSchema = z.object({
  status: z.enum(["new", "in_review", "resolved"]).optional(),
  adminNote: z.string().trim().max(2000).optional(),
});
