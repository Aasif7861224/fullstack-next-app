import crypto from "crypto";
import { revalidateTag } from "next/cache";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Property from "@/models/Property";
import { AppError } from "@/utils/errors";
import { env } from "@/lib/env";
import { CACHE_TAGS, ROLE } from "@/lib/constants";
import { getFeaturedTill } from "@/utils/feature";

export async function createFeatureOrder({ propertyId, amount, currency }, user) {
  await connectDB();
  const property = await Property.findById(propertyId);
  if (!property || property.isDeleted) throw new AppError(404, "Property not found");
  const isOwner = property.ownerId.toString() === user._id.toString();
  if (!isOwner && user.role !== ROLE.ADMIN) throw new AppError(403, "Not authorized");

  const finalAmount = Number(amount || property.price * 0.01 || 499);
  if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
    throw new AppError(400, "Invalid amount");
  }

  const orderId = `ord_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const payment = await Payment.create({
    userId: user._id,
    propertyId,
    purpose: "feature_listing",
    amount: finalAmount,
    currency: currency || "INR",
    orderId,
    status: "initiated",
  });

  return {
    orderId: payment.orderId,
    amount: payment.amount,
    currency: payment.currency,
  };
}

export async function verifyFeaturePayment({ orderId, paymentId }) {
  await connectDB();
  const payment = await Payment.findOne({ orderId });
  if (!payment) throw new AppError(404, "Order not found");

  if (!paymentId) {
    payment.status = "failed";
    await payment.save();
    throw new AppError(400, "Payment verification failed");
  }

  payment.paymentId = paymentId;
  payment.status = "paid";
  await payment.save();

  const property = await Property.findById(payment.propertyId);
  if (!property) throw new AppError(404, "Property missing");
  property.isFeatured = true;
  property.featuredTill = getFeaturedTill(env.featuredDurationDays);
  await property.save();

  revalidateTag(CACHE_TAGS.PROPERTIES);
  revalidateTag(`${CACHE_TAGS.PROPERTY}-${property.slug}`);
  revalidateTag(CACHE_TAGS.ADMIN_ANALYTICS);

  return {
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    featuredTill: property.featuredTill,
  };
}
