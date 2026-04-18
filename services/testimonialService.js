import { connectDb } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { AppError } from "@/utils/errors";

export async function createTestimonial(payload, user = null) {
  await connectDb();
  const testimonial = await Testimonial.create({
    userId: user?._id || null,
    name: payload.name || user?.name || "Anonymous",
    message: payload.message,
    rating: payload.rating,
    approved: false,
  });
  return testimonial;
}

export async function listApprovedTestimonials() {
  await connectDb();
  return Testimonial.find({ approved: true }).sort({ createdAt: -1 }).lean();
}

export async function approveTestimonial(id) {
  await connectDb();
  const updated = await Testimonial.findByIdAndUpdate(id, { approved: true }, { new: true }).lean();
  if (!updated) throw new AppError(404, "Testimonial not found");
  return updated;
}

