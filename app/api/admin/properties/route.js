import { listAdminPropertiesController } from "@/controllers/adminController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await listAdminPropertiesController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

