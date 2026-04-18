import { revalidateTag } from "next/cache";
import { connectDb } from "@/lib/db";
import { AppError } from "@/utils/errors";
import { CACHE_TAGS } from "@/lib/constants";
import { buildPaginationMeta } from "@/lib/pagination";
import Property from "@/models/Property";
import Inquiry from "@/models/Inquiry";
import SellerFeedback from "@/models/SellerFeedback";

async function expireFeaturedListingsForSeller(ownerId) {
  await Property.updateMany(
    {
      ownerId,
      isDeleted: false,
      isFeatured: true,
      featuredTill: { $lt: new Date() },
    },
    { $set: { isFeatured: false }, $unset: { featuredTill: 1 } }
  );
}

export async function getSellerAnalytics(user) {
  await connectDb();
  await expireFeaturedListingsForSeller(user._id);

  const ownerFilter = { ownerId: user._id };
  const activeFilter = { ...ownerFilter, isDeleted: false };

  const [
    total,
    active,
    pending,
    rejected,
    deleted,
    topViewed,
    viewAggregate,
    viewsByStatus,
    inquiryTotal,
    newInquiries,
    recentInquiries,
    activeFeatured,
    expiringSoon,
  ] = await Promise.all([
    Property.countDocuments(ownerFilter),
    Property.countDocuments({ ...activeFilter, status: "active" }),
    Property.countDocuments({ ...activeFilter, status: "pending" }),
    Property.countDocuments({ ...activeFilter, status: "rejected" }),
    Property.countDocuments({ ...ownerFilter, isDeleted: true }),
    Property.find(activeFilter)
      .sort({ views: -1, createdAt: -1 })
      .limit(8)
      .select("title slug views status city rentOrSell")
      .lean(),
    Property.aggregate([
      { $match: activeFilter },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          properties: { $sum: 1 },
        },
      },
    ]),
    Property.aggregate([
      { $match: activeFilter },
      {
        $group: {
          _id: "$status",
          views: { $sum: "$views" },
          properties: { $sum: 1 },
        },
      },
    ]),
    Inquiry.countDocuments({ ownerId: user._id }),
    Inquiry.countDocuments({ ownerId: user._id, status: "new" }),
    Inquiry.find({ ownerId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("propertyId", "title slug")
      .lean(),
    Property.countDocuments({
      ...activeFilter,
      isFeatured: true,
      featuredTill: { $gte: new Date() },
    }),
    Property.find({
      ...activeFilter,
      isFeatured: true,
      featuredTill: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
      .sort({ featuredTill: 1 })
      .limit(8)
      .select("title slug featuredTill views")
      .lean(),
  ]);

  const aggregate = viewAggregate[0] || { totalViews: 0, properties: 0 };
  const avgViewsPerProperty =
    aggregate.properties > 0 ? Number((aggregate.totalViews / aggregate.properties).toFixed(2)) : 0;

  return {
    propertyCounts: {
      total,
      active,
      pending,
      rejected,
      deleted,
    },
    viewStats: {
      totalViews: aggregate.totalViews || 0,
      avgViewsPerProperty,
      byStatus: viewsByStatus.map((row) => ({
        status: row._id || "unknown",
        views: row.views,
        properties: row.properties,
      })),
      topViewed,
    },
    inquiryStats: {
      total: inquiryTotal,
      newCount: newInquiries,
      recent: recentInquiries,
    },
    featuredStats: {
      activeFeatured,
      expiringSoon,
    },
  };
}

export async function createSellerFeedback(user, payload) {
  await connectDb();
  const feedback = await SellerFeedback.create({
    sellerId: user._id,
    subject: payload.subject,
    message: payload.message,
    priority: payload.priority || "medium",
  });
  revalidateTag(CACHE_TAGS.SELLER_FEEDBACK);
  revalidateTag(CACHE_TAGS.ADMIN_ANALYTICS);
  return feedback;
}

export async function listSellerFeedback(user, { page, limit, skip, status }) {
  await connectDb();
  const filter = { sellerId: user._id };
  if (status && status !== "all") {
    filter.status = status;
  }
  const [items, total] = await Promise.all([
    SellerFeedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SellerFeedback.countDocuments(filter),
  ]);
  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function listAdminSellerFeedback({ page, limit, skip, status, priority, q }) {
  await connectDb();
  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (priority && priority !== "all") {
    filter.priority = priority;
  }
  if (q) {
    filter.$or = [
      { subject: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
      { adminReply: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    SellerFeedback.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sellerId", "name email")
      .lean(),
    SellerFeedback.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function updateSellerFeedbackByAdmin(id, payload) {
  await connectDb();
  if (!payload.status && typeof payload.adminReply === "undefined") {
    throw new AppError(400, "status or adminReply is required");
  }
  const update = {};
  if (payload.status) update.status = payload.status;
  if (typeof payload.adminReply !== "undefined") update.adminReply = payload.adminReply;

  const feedback = await SellerFeedback.findByIdAndUpdate(id, update, { new: true })
    .populate("sellerId", "name email")
    .lean();
  if (!feedback) throw new AppError(404, "Feedback not found");

  revalidateTag(CACHE_TAGS.SELLER_FEEDBACK);
  revalidateTag(CACHE_TAGS.ADMIN_ANALYTICS);
  return feedback;
}
