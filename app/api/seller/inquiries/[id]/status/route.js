import { updateOwnerInquiryStatusController } from "@/controllers/inquiryController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    return await updateOwnerInquiryStatusController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}
