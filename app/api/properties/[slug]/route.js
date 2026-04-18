import { getPropertyBySlugController } from "@/controllers/propertyController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    return await getPropertyBySlugController(slug, ok);
  } catch (err) {
    return handleError(err);
  }
}

