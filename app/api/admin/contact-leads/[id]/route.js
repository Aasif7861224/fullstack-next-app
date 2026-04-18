import { updateAdminContactLeadController } from "@/controllers/contactLeadController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    return await updateAdminContactLeadController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}
