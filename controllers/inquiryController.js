import { getAuthUserFromRequest, getOptionalAuthUserFromRequest, requireRole } from "@/lib/auth";
import { ROLE } from "@/lib/constants";
import {
  createInquiry,
  listMyInquiries,
  listOwnerInquiries,
  updateOwnerInquiryStatus,
} from "@/services/inquiryService";
import { inquirySchema } from "@/validators/inquiryValidator";
import { sellerInquiryStatusSchema } from "@/validators/sellerValidator";

export async function createInquiryController(request, responseBuilder) {
  const body = await request.json();
  const payload = inquirySchema.parse(body);
  const sender = await getOptionalAuthUserFromRequest(request);
  const inquiry = await createInquiry(payload, sender);
  return responseBuilder(inquiry, 201);
}

export async function listMyInquiriesController(request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const items = await listMyInquiries(user);
  return responseBuilder(items);
}

export async function listOwnerInquiriesController(request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  requireRole(user, [ROLE.OWNER, ROLE.ADMIN]);
  const items = await listOwnerInquiries(user);
  return responseBuilder(items);
}

export async function updateOwnerInquiryStatusController(id, request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  requireRole(user, [ROLE.OWNER]);
  const body = await request.json();
  const payload = sellerInquiryStatusSchema.parse(body);
  const item = await updateOwnerInquiryStatus(user, id, payload.status);
  return responseBuilder(item);
}
