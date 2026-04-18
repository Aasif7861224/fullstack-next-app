import { z } from "zod";

export const propertyPayloadSchema = z.object({
  title: z.string().min(3),
  location: z.string().min(2),
  city: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  price: z.coerce.number().positive(),
  bhk: z.coerce.number().optional(),
  propertyType: z.enum(["Flat", "Plot", "Villa", "House", "Other"]).default("Flat"),
  rentOrSell: z.enum(["Rent", "Sell"]),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

