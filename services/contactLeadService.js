import { revalidateTag } from "next/cache";
import connectDB from "@/lib/db";
import { CACHE_TAGS } from "@/lib/constants";
import { buildPaginationMeta } from "@/lib/pagination";
import { AppError } from "@/utils/errors";
import ContactLead from "@/models/ContactLead";

export async function createContactLead(payload) {
  await connectDB();
  const lead = await ContactLead.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    phone: payload.phone || "",
    subject: payload.subject,
    message: payload.message,
    sourcePage: payload.sourcePage || "/contact",
  });
  revalidateTag(CACHE_TAGS.CONTACT_LEADS);
  revalidateTag(CACHE_TAGS.ADMIN_ANALYTICS);
  return lead;
}

export async function listAdminContactLeads({ page, limit, skip, status, q }) {
  await connectDB();
  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    ContactLead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactLead.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function updateContactLeadByAdmin(id, payload) {
  await connectDB();
  if (!payload.status && typeof payload.adminNote === "undefined") {
    throw new AppError(400, "status or adminNote is required");
  }

  const update = {};
  if (payload.status) update.status = payload.status;
  if (typeof payload.adminNote !== "undefined") update.adminNote = payload.adminNote;

  const item = await ContactLead.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) throw new AppError(404, "Contact lead not found");

  revalidateTag(CACHE_TAGS.CONTACT_LEADS);
  revalidateTag(CACHE_TAGS.ADMIN_ANALYTICS);
  return item;
}
