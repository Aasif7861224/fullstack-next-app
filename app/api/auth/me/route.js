import { meController } from "@/controllers/authController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await meController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

