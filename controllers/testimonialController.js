import { getAuthUserFromRequest, requireRole } from "@/lib/auth";
import { createTestimonial, listApprovedTestimonials, approveTestimonial } from "@/services/testimonialService";
import { ROLE } from "@/lib/constants";
import { testimonialCreateSchema } from "@/validators/testimonialValidator";
import { readJsonBody } from "@/utils/request";

export async function createTestimonialController(request, responseBuilder) {
  const body = await readJsonBody(request);
  const payload = testimonialCreateSchema.parse(body);
  const user = await getAuthUserFromRequest(request).catch(() => null);
  const testimonial = await createTestimonial(payload, user);
  return responseBuilder(testimonial, 201);
}

export async function listApprovedTestimonialsController(responseBuilder) {
  const items = await listApprovedTestimonials();
  return responseBuilder(items);
}

export async function approveTestimonialController(id, request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  requireRole(user, [ROLE.ADMIN]);
  const item = await approveTestimonial(id);
  return responseBuilder(item);
}
