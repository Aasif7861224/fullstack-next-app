import { z } from "zod";

export const sellerFeedbackCreateSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const sellerFeedbackAdminUpdateSchema = z.object({
  status: z.enum(["open", "in_review", "resolved"]).optional(),
  adminReply: z.string().trim().max(4000).optional(),
});

export const sellerInquiryStatusSchema = z.object({
  status: z.enum(["new", "read", "closed"]),
});
