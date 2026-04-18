import { exportReportsController } from "@/controllers/adminController";
import { handleError } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await exportReportsController(request);
  } catch (err) {
    return handleError(err);
  }
}

