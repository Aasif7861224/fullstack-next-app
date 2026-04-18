import {
  createTestimonialController,
  listApprovedTestimonialsController,
} from "@/controllers/testimonialController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET() {
  try {
    return await listApprovedTestimonialsController(ok);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request) {
  try {
    return await createTestimonialController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

