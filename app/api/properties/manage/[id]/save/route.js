import { savePropertyController, unsavePropertyController } from "@/controllers/propertyController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    return await savePropertyController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    return await unsavePropertyController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}

