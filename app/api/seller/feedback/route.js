import {
  createSellerFeedbackController,
  listSellerFeedbackController,
} from "@/controllers/sellerController";
import { handleError, ok } from "@/utils/response";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    return await listSellerFeedbackController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request) {
  try {
    return await createSellerFeedbackController(request, ok);
  } catch (err) {
    return handleError(err);
  }
}
