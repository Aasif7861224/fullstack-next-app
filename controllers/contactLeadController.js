import { getAuthUserFromRequest, requireRole } from "@/lib/auth";
import { ROLE } from "@/lib/constants";
import { parsePagination } from "@/lib/pagination";
import {
  contactLeadAdminUpdateSchema,
  contactLeadCreateSchema,
} from "@/validators/contactLeadValidator";
import {
  createContactLead,
  listAdminContactLeads,
  updateContactLeadByAdmin,
} from "@/services/contactLeadService";
import { readJsonBody } from "@/utils/request";

export async function createContactLeadController(request, responseBuilder) {
  const body = await readJsonBody(request);
  const payload = contactLeadCreateSchema.parse(body);
  const lead = await createContactLead(payload);
  return responseBuilder(lead, 201);
}

async function requireAdmin(request) {
  const user = await getAuthUserFromRequest(request);
  requireRole(user, [ROLE.ADMIN]);
  return user;
}

export async function listAdminContactLeadsController(request, responseBuilder) {
  await requireAdmin(request);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") || "all";
  const q = searchParams.get("q") || "";
  const data = await listAdminContactLeads({ page, limit, skip, status, q });
  return responseBuilder(data);
}

export async function updateAdminContactLeadController(id, request, responseBuilder) {
  await requireAdmin(request);
  const body = await readJsonBody(request);
  const payload = contactLeadAdminUpdateSchema.parse(body);
  const data = await updateContactLeadByAdmin(id, payload);
  return responseBuilder(data);
}
