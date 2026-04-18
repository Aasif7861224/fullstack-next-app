import { updateAdminSellerFeedbackController } from "@/controllers/adminController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    return await updateAdminSellerFeedbackController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}
