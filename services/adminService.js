import { revalidateTag } from "next/cache";
import connectDB from "@/lib/db";
import Property from "@/models/Property";
import User from "@/models/User";
import Inquiry from "@/models/Inquiry";
import Testimonial from "@/models/Testimonial";
import Payment from "@/models/Payment";
import SellerFeedback from "@/models/SellerFeedback";
import { AppError } from "@/utils/errors";
import { CACHE_TAGS, PROPERTY_STATUS } from "@/lib/constants";
import { buildPaginationMeta } from "@/lib/pagination";

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

async function buildInquiryTrend(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const trendRaw = await Inquiry.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const countMap = new Map(trendRaw.map((row) => [row._id, row.count]));
  const trend = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = getDateKey(day);
    trend.push({ date: key, count: countMap.get(key) || 0 });
  }
  return trend;
}

export async function moderatePropertyStatus(id, status) {
  await connectDB();
  const property = await Property.findOneAndUpdate(
    { _id: id },
    { status, isDeleted: false, deletedAt: null, deletedBy: null },
    { new: true }
  ).lean();
  if (!property) throw new AppError(404, "Property not found");

  revalidateTag(CACHE_TAGS.PROPERTIES);
  revalidateTag(`${CACHE_TAGS.PROPERTY}-${property.slug}`);
  revalidateTag(CACHE_TAGS.ADMIN_ANALYTICS);
  return property;
}

export async function restoreDeletedProperty(id) {
  await connectDB();
  const property = await Property.findOneAndUpdate(
    { _id: id, isDeleted: true },
    { isDeleted: false, deletedAt: null, deletedBy: null, status: PROPERTY_STATUS.PENDING },
    { new: true }
  ).lean();
  if (!property) throw new AppError(404, "Deleted property not found");

  revalidateTag(CACHE_TAGS.PROPERTIES);
  revalidateTag(`${CACHE_TAGS.PROPERTY}-${property.slug}`);
  revalidateTag(CACHE_TAGS.ADMIN_ANALYTICS);
  return property;
}

export async function listUsers() {
  await connectDB();
  return User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
}

export async function updateUserStatus(id, action) {
  await connectDB();
  if (action !== "activate" && action !== "deactivate") {
    throw new AppError(400, "Invalid status action");
  }
  const disabled = action === "deactivate";
  const user = await User.findByIdAndUpdate(id, { disabled }, { new: true })
    .select("-passwordHash")
    .lean();
  if (!user) throw new AppError(404, "User not found");
  revalidateTag(CACHE_TAGS.ADMIN_ANALYTICS);
  return user;
}

export async function listAdminProperties({ page, limit, skip, status, deleted, q }) {
  await connectDB();
  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (deleted === "only") filter.isDeleted = true;
  if (deleted === "exclude") filter.isDeleted = false;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "name email role")
      .lean(),
    Property.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function listAdminTestimonials({ approved, page, limit, skip }) {
  await connectDB();
  const filter = {};
  if (approved === "true") filter.approved = true;
  if (approved === "false") filter.approved = false;
  const [items, total] = await Promise.all([
    Testimonial.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Testimonial.countDocuments(filter),
  ]);
  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function listAdminInquiries({ page, limit, skip, status, q }) {
  await connectDB();
  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("propertyId", "title slug")
      .populate("ownerId", "name email")
      .lean(),
    Inquiry.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getAdminAnalytics() {
  await connectDB();

  const [totalProperties, pendingProperties, activeProperties, rejectedProperties, deletedProperties] =
    await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: PROPERTY_STATUS.PENDING, isDeleted: false }),
      Property.countDocuments({ status: PROPERTY_STATUS.ACTIVE, isDeleted: false }),
      Property.countDocuments({ status: PROPERTY_STATUS.REJECTED, isDeleted: false }),
      Property.countDocuments({ isDeleted: true }),
    ]);

  const [
    inquiryTotal,
    recentInquiriesCount,
    topViewed,
    activeFeatured,
    ownerCount,
    userCount,
    approvedTestimonials,
    recentInquiries,
    pendingApprovalList,
    recentUsers,
    paidFeatureRevenue,
    inquiryTrend7d,
    sellerFeedbackTotal,
    sellerFeedbackOpen,
    sellerFeedbackInReview,
    sellerFeedbackResolved,
    recentSellerFeedback,
  ] = await Promise.all([
    Inquiry.countDocuments(),
    Inquiry.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    Property.find({ isDeleted: false })
      .sort({ views: -1 })
      .limit(8)
      .select("title slug views city createdAt")
      .lean(),
    Property.countDocuments({
      isDeleted: false,
      isFeatured: true,
      featuredTill: { $gte: new Date() },
    }),
    User.countDocuments({ role: "owner", disabled: false }),
    User.countDocuments({ role: "user", disabled: false }),
    Testimonial.countDocuments({ approved: true }),
    Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("propertyId", "title slug")
      .lean(),
    Property.find({ status: PROPERTY_STATUS.PENDING, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title slug city price createdAt")
      .populate("ownerId", "name email")
      .lean(),
    User.find().sort({ createdAt: -1 }).limit(10).select("name email role disabled createdAt").lean(),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$currency", total: { $sum: "$amount" } } },
    ]),
    buildInquiryTrend(7),
    SellerFeedback.countDocuments(),
    SellerFeedback.countDocuments({ status: "open" }),
    SellerFeedback.countDocuments({ status: "in_review" }),
    SellerFeedback.countDocuments({ status: "resolved" }),
    SellerFeedback.find()
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(8)
      .populate("sellerId", "name email")
      .lean(),
  ]);

  return {
    properties: {
      total: totalProperties,
      pending: pendingProperties,
      active: activeProperties,
      rejected: rejectedProperties,
      deleted: deletedProperties,
      statusDistribution: [
        { label: "Active", value: activeProperties },
        { label: "Pending", value: pendingProperties },
        { label: "Rejected", value: rejectedProperties },
        { label: "Deleted", value: deletedProperties },
      ],
    },
    inquiries: {
      total: inquiryTotal,
      last7Days: recentInquiriesCount,
      trend7d: inquiryTrend7d,
      recent: recentInquiries,
    },
    users: {
      sellers: ownerCount,
      owners: ownerCount,
      users: userCount,
      recent: recentUsers,
    },
    featured: {
      activeFeatured,
      revenueByCurrency: paidFeatureRevenue,
    },
    testimonials: {
      approved: approvedTestimonials,
    },
    sellerFeedback: {
      total: sellerFeedbackTotal,
      open: sellerFeedbackOpen,
      inReview: sellerFeedbackInReview,
      resolved: sellerFeedbackResolved,
      recent: recentSellerFeedback,
    },
    moderationQueue: pendingApprovalList,
    topViewed,
  };
}

export async function getReportsDataset() {
  await connectDB();
  const analytics = await getAdminAnalytics();

  const [properties, inquiries, users, payments, testimonials, sellerFeedback] = await Promise.all([
    Property.find()
      .sort({ createdAt: -1 })
      .limit(1000)
      .populate("ownerId", "name email")
      .lean(),
    Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(1000)
      .populate("propertyId", "title slug")
      .lean(),
    User.find().sort({ createdAt: -1 }).limit(1000).select("name email role disabled createdAt").lean(),
    Payment.find().sort({ createdAt: -1 }).limit(1000).populate("propertyId", "title slug").lean(),
    Testimonial.find().sort({ createdAt: -1 }).limit(1000).lean(),
    SellerFeedback.find()
      .sort({ createdAt: -1 })
      .limit(1000)
      .populate("sellerId", "name email")
      .lean(),
  ]);

  return {
    analytics,
    properties,
    inquiries,
    users,
    payments,
    testimonials,
    sellerFeedback,
  };
}
