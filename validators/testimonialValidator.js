import { z } from "zod";

export const testimonialCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value || undefined)
    .pipe(z.string().min(2).max(80).optional()),
  message: z.string().trim().min(10).max(2000),
  rating: z.coerce.number().int().min(1).max(5),
});
