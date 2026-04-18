import { listAdminContactLeadsController } from "@/controllers/contactLeadController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await listAdminContactLeadsController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}
