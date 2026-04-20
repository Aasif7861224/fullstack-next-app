import { z } from "zod";
import { ROLE } from "@/lib/constants";

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  role: z.enum([ROLE.USER, ROLE.OWNER]).optional(),
  contact: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});
