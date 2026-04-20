import { z } from "zod";

export const userStatusSchema = z.object({
  action: z.enum(["activate", "deactivate"]),
});
