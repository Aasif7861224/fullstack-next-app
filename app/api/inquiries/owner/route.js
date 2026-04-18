import { listOwnerInquiriesController } from "@/controllers/inquiryController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await listOwnerInquiriesController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

