import { listMyPropertiesController } from "@/controllers/propertyController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await listMyPropertiesController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

