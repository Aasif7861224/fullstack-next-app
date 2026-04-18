import { approveTestimonialController } from "@/controllers/testimonialController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    return await approveTestimonialController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}

