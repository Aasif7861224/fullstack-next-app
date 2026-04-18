import { logoutController } from "@/controllers/authController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function POST() {
  try {
    return await logoutController(ok);
  } catch (err) {
    return handleError(err);
  }
}

