import { createContactLeadController } from "@/controllers/contactLeadController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    return await createContactLeadController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}
