import connectDB from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import Property from "@/models/Property";
import { PROPERTY_STATUS } from "@/lib/constants";
import { AppError } from "@/utils/errors";
import { sendInquiryNotifications } from "@/services/emailService";

export async function createInquiry(payload, senderUser = null) {
  await connectDB();
  const property = await Property.findOne({
    _id: payload.propertyId,
    isDeleted: false,
    status: PROPERTY_STATUS.ACTIVE,
  })
    .populate("ownerId", "email name")
    .lean();
  if (!property) throw new AppError(404, "Property not found");
  if (!property.ownerId?._id || !property.ownerId?.email) {
    throw new AppError(409, "Property owner is unavailable");
  }

  const inquiry = await Inquiry.create({
    propertyId: property._id,
    ownerId: property.ownerId._id,
    senderUserId: senderUser?._id || null,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || "",
    message: payload.message.trim(),
  });

  const emailStatus = await sendInquiryNotifications({
    ownerEmail: property.ownerId.email,
    senderEmail: payload.email,
    propertyTitle: property.title,
    message: payload.message,
    name: payload.name,
  });

  inquiry.ownerEmailSent = emailStatus.ownerEmailSent;
  inquiry.senderEmailSent = emailStatus.senderEmailSent;
  await inquiry.save();

  return inquiry;
}

export async function listMyInquiries(user) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  return Inquiry.find({ senderUserId: user._id }).sort({ createdAt: -1 }).populate("propertyId").lean();
}

export async function listOwnerInquiries(user) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  return Inquiry.find({ ownerId: user._id })
    .sort({ createdAt: -1 })
    .populate("propertyId", "title slug status city")
    .lean();
}

export async function updateOwnerInquiryStatus(user, inquiryId, status) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  const inquiry = await Inquiry.findOneAndUpdate(
    { _id: inquiryId, ownerId: user._id },
    { status },
    { new: true }
  )
    .populate("propertyId", "title slug status city")
    .lean();

  if (!inquiry) throw new AppError(404, "Inquiry not found");
  return inquiry;
}
