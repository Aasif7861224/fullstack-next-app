import { createInquiryController } from "@/controllers/inquiryController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    return await createInquiryController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

