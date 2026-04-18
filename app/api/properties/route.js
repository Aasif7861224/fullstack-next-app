import {
  createPropertyController,
  listPublicPropertiesController,
} from "@/controllers/propertyController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await listPublicPropertiesController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request) {
  try {
    return await createPropertyController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

