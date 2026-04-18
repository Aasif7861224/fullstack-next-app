import {
  deletePropertyController,
  getManagedPropertyController,
  updatePropertyController,
} from "@/controllers/propertyController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    return await getManagedPropertyController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    return await updatePropertyController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    return await deletePropertyController(id, request, ok);
  } catch (err) {
    return handleError(err);
  }
}
