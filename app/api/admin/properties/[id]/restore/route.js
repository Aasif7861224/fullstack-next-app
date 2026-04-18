import { restorePropertyController } from "@/controllers/adminController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    return await restorePropertyController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}

