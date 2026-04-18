import { incrementPropertyViewController } from "@/controllers/propertyController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function POST(_request, { params }) {
  try {
    const { slug } = await params;
    return await incrementPropertyViewController(slug, ok);
  } catch (err) {
    return handleError(err);
  }
}

