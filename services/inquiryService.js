import connectDB from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import Property from "@/models/Property";
import { AppError } from "@/utils/errors";
import { sendInquiryNotifications } from "@/services/emailService";

export async function createInquiry(payload, senderUser = null) {
  await connectDB();
  const property = await Property.findOne({ _id: payload.propertyId, isDeleted: false })
    .populate("ownerId", "email name")
    .lean();
  if (!property) throw new AppError(404, "Property not found");

  const inquiry = await Inquiry.create({
    propertyId: property._id,
    ownerId: property.ownerId._id,
    senderUserId: senderUser?._id || null,
    name: payload.name,
    email: payload.email,
    phone: payload.phone || "",
    message: payload.message,
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
  return Inquiry.find({ senderUserId: user._id }).sort({ createdAt: -1 }).populate("propertyId").lean();
}

export async function listOwnerInquiries(user) {
  await connectDB();
  return Inquiry.find({ ownerId: user._id })
    .sort({ createdAt: -1 })
    .populate("propertyId", "title slug status city")
    .lean();
}

export async function updateOwnerInquiryStatus(user, inquiryId, status) {
  await connectDB();
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
