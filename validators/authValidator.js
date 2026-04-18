import { z } from "zod";
import { ROLE } from "@/lib/constants";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([ROLE.USER, ROLE.OWNER]).optional(),
  contact: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

