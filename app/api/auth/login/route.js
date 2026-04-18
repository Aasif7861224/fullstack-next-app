import { loginController } from "@/controllers/authController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    return await loginController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

