import { listAdminTestimonialsController } from "@/controllers/adminController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await listAdminTestimonialsController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

