import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAuthUserFromRequest, requireRole } from "@/lib/auth";
import { ROLE, PROPERTY_STATUS } from "@/lib/constants";
import { parsePagination } from "@/lib/pagination";
import {
  getAdminAnalytics,
  listAdminInquiries,
  getReportsDataset,
  listAdminProperties,
  listAdminTestimonials,
  listUsers,
  moderatePropertyStatus,
  restoreDeletedProperty,
  updateUserStatus,
} from "@/services/adminService";
import { listAdminSellerFeedback, updateSellerFeedbackByAdmin } from "@/services/sellerService";
import { userStatusSchema } from "@/validators/adminValidator";
import { sellerFeedbackAdminUpdateSchema } from "@/validators/sellerValidator";
import { readJsonBody } from "@/utils/request";

async function requireAdmin(request) {
  const user = await getAuthUserFromRequest(request);
  requireRole(user, [ROLE.ADMIN]);
  return user;
}

function stringifyDate(input) {
  if (!input) return "";
  return new Date(input).toLocaleString();
}

export async function approvePropertyController(id, request, responseBuilder) {
  await requireAdmin(request);
  const data = await moderatePropertyStatus(id, PROPERTY_STATUS.ACTIVE);
  return responseBuilder(data);
}

export async function rejectPropertyController(id, request, responseBuilder) {
  await requireAdmin(request);
  const data = await moderatePropertyStatus(id, PROPERTY_STATUS.REJECTED);
  return responseBuilder(data);
}

export async function restorePropertyController(id, request, responseBuilder) {
  await requireAdmin(request);
  const data = await restoreDeletedProperty(id);
  return responseBuilder(data);
}

export async function listUsersController(request, responseBuilder) {
  await requireAdmin(request);
  const data = await listUsers();
  return responseBuilder(data);
}

export async function updateUserStatusController(id, request, responseBuilder) {
  await requireAdmin(request);
  const body = await readJsonBody(request);
  const payload = userStatusSchema.parse(body);
  const data = await updateUserStatus(id, payload.action);
  return responseBuilder(data);
}

export async function analyticsController(request, responseBuilder) {
  await requireAdmin(request);
  const data = await getAdminAnalytics();
  return responseBuilder(data);
}

export async function listAdminPropertiesController(request, responseBuilder) {
  await requireAdmin(request);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") || "all";
  const deleted = searchParams.get("deleted") || "exclude";
  const q = searchParams.get("q") || "";

  const data = await listAdminProperties({ page, limit, skip, status, deleted, q });
  return responseBuilder(data);
}

export async function listAdminTestimonialsController(request, responseBuilder) {
  await requireAdmin(request);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const approved = searchParams.get("approved") || "all";
  const data = await listAdminTestimonials({ approved, page, limit, skip });
  return responseBuilder(data);
}

export async function listAdminInquiriesController(request, responseBuilder) {
  await requireAdmin(request);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") || "all";
  const q = searchParams.get("q") || "";
  const data = await listAdminInquiries({ page, limit, skip, status, q });
  return responseBuilder(data);
}

export async function listAdminSellerFeedbackController(request, responseBuilder) {
  await requireAdmin(request);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") || "all";
  const priority = searchParams.get("priority") || "all";
  const q = searchParams.get("q") || "";
  const data = await listAdminSellerFeedback({ page, limit, skip, status, priority, q });
  return responseBuilder(data);
}

export async function updateAdminSellerFeedbackController(id, request, responseBuilder) {
  await requireAdmin(request);
  const body = await readJsonBody(request);
  const payload = sellerFeedbackAdminUpdateSchema.parse(body);
  const data = await updateSellerFeedbackByAdmin(id, payload);
  return responseBuilder(data);
}

export async function exportReportsController(request) {
  await requireAdmin(request);
  const report = await getReportsDataset();

  const workbook = XLSX.utils.book_new();

  const summaryRows = [
    { Metric: "Properties Total", Value: report.analytics.properties.total },
    { Metric: "Properties Active", Value: report.analytics.properties.active },
    { Metric: "Properties Pending", Value: report.analytics.properties.pending },
    { Metric: "Properties Rejected", Value: report.analytics.properties.rejected },
    { Metric: "Properties Deleted", Value: report.analytics.properties.deleted },
    { Metric: "Inquiries Total", Value: report.analytics.inquiries.total },
    { Metric: "Inquiries Last 7 Days", Value: report.analytics.inquiries.last7Days },
    { Metric: "Active Featured", Value: report.analytics.featured.activeFeatured },
    { Metric: "Sellers", Value: report.analytics.users.sellers },
    { Metric: "Users", Value: report.analytics.users.users },
    { Metric: "Approved Testimonials", Value: report.analytics.testimonials.approved },
    { Metric: "Seller Feedback (Open)", Value: report.analytics.sellerFeedback.open },
  ];

  const propertiesSheet = report.properties.map((item) => ({
    title: item.title,
    slug: item.slug,
    city: item.city,
    location: item.location,
    price: item.price,
    status: item.status,
    isDeleted: item.isDeleted,
    isFeatured: item.isFeatured,
    featuredTill: stringifyDate(item.featuredTill),
    views: item.views,
    sellerName: item.ownerId?.name || "",
    sellerEmail: item.ownerId?.email || "",
    createdAt: stringifyDate(item.createdAt),
  }));

  const inquiriesSheet = report.inquiries.map((item) => ({
    name: item.name,
    email: item.email,
    phone: item.phone,
    status: item.status,
    propertyTitle: item.propertyId?.title || "",
    propertySlug: item.propertyId?.slug || "",
    message: item.message,
    ownerEmailSent: item.ownerEmailSent,
    senderEmailSent: item.senderEmailSent,
    createdAt: stringifyDate(item.createdAt),
  }));

  const usersSheet = report.users.map((item) => ({
    name: item.name,
    email: item.email,
    role: item.role,
    disabled: item.disabled,
    createdAt: stringifyDate(item.createdAt),
  }));

  const paymentsSheet = report.payments.map((item) => ({
    orderId: item.orderId,
    paymentId: item.paymentId || "",
    purpose: item.purpose,
    amount: item.amount,
    currency: item.currency,
    status: item.status,
    propertyTitle: item.propertyId?.title || "",
    propertySlug: item.propertyId?.slug || "",
    createdAt: stringifyDate(item.createdAt),
  }));

  const testimonialsSheet = report.testimonials.map((item) => ({
    name: item.name,
    rating: item.rating,
    approved: item.approved,
    message: item.message,
    createdAt: stringifyDate(item.createdAt),
  }));

  const sellerFeedbackSheet = report.sellerFeedback.map((item) => ({
    sellerName: item.sellerId?.name || "",
    sellerEmail: item.sellerId?.email || "",
    subject: item.subject,
    priority: item.priority,
    status: item.status,
    message: item.message,
    adminReply: item.adminReply || "",
    createdAt: stringifyDate(item.createdAt),
    updatedAt: stringifyDate(item.updatedAt),
  }));

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Summary");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(propertiesSheet), "Properties");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(inquiriesSheet), "Inquiries");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(usersSheet), "Users");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(paymentsSheet), "Payments");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(testimonialsSheet), "Testimonials");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sellerFeedbackSheet), "SellerFeedback");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="admin-reports-${Date.now()}.xlsx"`,
    },
  });
}
