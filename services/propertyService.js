import { revalidateTag } from "next/cache";
import connectDB from "@/lib/db";
import Property from "@/models/Property";
import User from "@/models/User";
import { AppError } from "@/utils/errors";
import { generateUniqueSlug } from "@/lib/slug";
import { buildPaginationMeta } from "@/lib/pagination";
import { CACHE_TAGS, PROPERTY_STATUS, ROLE } from "@/lib/constants";
import { persistImageFiles } from "@/utils/fileUpload";
import { parseArrayField, parseOptionalNumber, parseStringField } from "@/utils/request";

const PROPERTY_TYPES = new Set(["Flat", "Plot", "Villa", "House", "Other"]);
const RENT_OR_SELL_TYPES = new Set(["Rent", "Sell"]);

function parseAmenities(value) {
  return parseArrayField(value);
}

function parseExistingImages(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((img) => img?.url)
      .map((img, index) => ({
        url: `${img.url}`,
        isPrimary: Boolean(img.isPrimary),
        altText: img.altText || `property image ${index + 1}`,
      }));
  } catch {
    return [];
  }
}

function normalizePrimaryImage(images) {
  if (!images.length) return images;
  const hasPrimary = images.some((item) => item.isPrimary);
  if (!hasPrimary) images[0].isPrimary = true;
  return images.map((item, index) => ({
    ...item,
    isPrimary: item.isPrimary && images.findIndex((img) => img.isPrimary) === index,
  }));
}

function parseEnumValue(value, fieldName, allowedValues, fallback = "") {
  const normalized = parseStringField(value, fieldName, { fallback });
  if (!normalized) {
    return normalized;
  }
  if (!allowedValues.has(normalized)) {
    throw new AppError(400, `${fieldName} must be one of: ${Array.from(allowedValues).join(", ")}`);
  }
  return normalized;
}

function parsePropertyPayload(formData) {
  const title = parseStringField(formData.get("title"), "title", { required: true });
  const location = parseStringField(formData.get("location"), "location", { required: true });
  const city = parseStringField(formData.get("city"), "city");
  const price = parseOptionalNumber(formData.get("price"), "price", { min: 1 });
  const rentOrSell = parseEnumValue(formData.get("rentOrSell"), "rentOrSell", RENT_OR_SELL_TYPES);
  const propertyType = parseEnumValue(
    formData.get("propertyType"),
    "propertyType",
    PROPERTY_TYPES,
    "Flat"
  );
  const description = parseStringField(formData.get("description"), "description");
  const bhk = parseOptionalNumber(formData.get("bhk"), "bhk", { min: 1, integer: true });
  const latitude = parseOptionalNumber(formData.get("latitude"), "latitude", { min: -90, max: 90 });
  const longitude = parseOptionalNumber(formData.get("longitude"), "longitude", { min: -180, max: 180 });
  const amenities = parseAmenities(formData.get("amenities"));

  if (typeof price === "undefined") {
    throw new AppError(400, "price is required");
  }
  if (!rentOrSell) {
    throw new AppError(400, "rentOrSell is required");
  }

  return {
    title,
    location,
    city,
    price,
    rentOrSell,
    propertyType,
    description,
    bhk,
    latitude,
    longitude,
    amenities,
  };
}

export async function expireFeaturedListings() {
  await connectDB();
  await Property.updateMany(
    { isFeatured: true, featuredTill: { $lt: new Date() } },
    { $set: { isFeatured: false }, $unset: { featuredTill: 1 } }
  );
}

export async function listPublicProperties({ page, limit, skip, query }) {
  await connectDB();
  await expireFeaturedListings();

  const filter = {
    isDeleted: false,
    status: PROPERTY_STATUS.ACTIVE,
  };

  if (query.q) {
    filter.$or = [
      { title: { $regex: query.q, $options: "i" } },
      { location: { $regex: query.q, $options: "i" } },
      { city: { $regex: query.q, $options: "i" } },
    ];
  }
  if (query.city) filter.city = { $regex: query.city, $options: "i" };
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.rentOrSell) filter.rentOrSell = query.rentOrSell;
  const bhk = parseOptionalNumber(query.bhk, "bhk", { min: 1, integer: true });
  const minPrice = parseOptionalNumber(query.minPrice, "minPrice", { min: 0 });
  const maxPrice = parseOptionalNumber(query.maxPrice, "maxPrice", { min: 0 });
  if (typeof bhk !== "undefined") {
    filter.bhk = bhk;
  }
  if (typeof minPrice !== "undefined" || typeof maxPrice !== "undefined") {
    filter.price = {};
    if (typeof minPrice !== "undefined") filter.price.$gte = minPrice;
    if (typeof maxPrice !== "undefined") filter.price.$lte = maxPrice;
  }
  if (
    typeof minPrice !== "undefined" &&
    typeof maxPrice !== "undefined" &&
    minPrice > maxPrice
  ) {
    throw new AppError(400, "minPrice cannot be greater than maxPrice");
  }

  let sort = { createdAt: -1 };
  if (query.sort === "price_asc") sort = { price: 1 };
  if (query.sort === "price_desc") sort = { price: -1 };
  if (query.sort === "views_desc") sort = { views: -1 };
  if (query.sort === "featured") sort = { isFeatured: -1, featuredTill: -1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Property.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "name email contact")
      .lean(),
    Property.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getPropertyBySlug(slug) {
  await connectDB();
  await expireFeaturedListings();
  const property = await Property.findOne({
    slug,
    isDeleted: false,
    status: PROPERTY_STATUS.ACTIVE,
  })
    .populate("ownerId", "name email contact")
    .lean();

  if (!property) throw new AppError(404, "Property not found");
  return property;
}

export async function listRelatedProperties(property, limit = 4) {
  await connectDB();
  const filter = {
    _id: { $ne: property._id },
    isDeleted: false,
    status: PROPERTY_STATUS.ACTIVE,
  };

  if (property.city) {
    filter.city = property.city;
  } else if (property.location) {
    filter.location = { $regex: property.location, $options: "i" };
  }

  const items = await Property.find(filter)
    .sort({ isFeatured: -1, views: -1, createdAt: -1 })
    .limit(limit)
    .populate("ownerId", "name email contact")
    .lean();
  return items;
}

export async function incrementPropertyView(slug) {
  await connectDB();
  const updated = await Property.findOneAndUpdate(
    { slug, isDeleted: false, status: PROPERTY_STATUS.ACTIVE },
    { $inc: { views: 1 } },
    { new: true, projection: { views: 1, slug: 1 } }
  ).lean();
  if (!updated) throw new AppError(404, "Property not found");
  return updated;
}

export async function createPropertyFromForm(formData, user) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  if (![ROLE.OWNER, ROLE.ADMIN].includes(user.role)) {
    throw new AppError(403, "Only owners/admin can create properties");
  }

  const { title, location, city, price, rentOrSell, propertyType, description, bhk, latitude, longitude, amenities } =
    parsePropertyPayload(formData);

  const files = formData.getAll("images").filter((file) => file?.size > 0);
  const uploadedImages = await persistImageFiles(files);
  const images = normalizePrimaryImage(uploadedImages);

  const slug = await generateUniqueSlug(Property, title, city || location);

  const property = await Property.create({
    title,
    slug,
    location,
    city,
    latitude,
    longitude,
    price,
    bhk,
    propertyType,
    rentOrSell,
    description,
    amenities,
    images,
    ownerId: user._id,
    status: PROPERTY_STATUS.PENDING,
  });

  revalidateTag(CACHE_TAGS.PROPERTIES);
  return property;
}

export async function updatePropertyFromForm(id, formData, user) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  const property = await Property.findById(id);
  if (!property || property.isDeleted) throw new AppError(404, "Property not found");
  const isOwner = property.ownerId.toString() === user._id.toString();
  if (!isOwner && user.role !== ROLE.ADMIN) throw new AppError(403, "Not authorized");

  const oldSlug = property.slug;
  const next = parsePropertyPayload(formData);

  property.title = next.title;
  property.location = next.location;
  property.city = next.city;
  property.price = next.price;
  property.rentOrSell = next.rentOrSell;
  property.propertyType = next.propertyType;
  property.description = next.description;
  property.bhk = next.bhk;
  property.latitude = next.latitude;
  property.longitude = next.longitude;
  property.amenities = next.amenities;
  property.slug = await generateUniqueSlug(Property, property.title, property.city || property.location, property._id);

  const existingImages = parseExistingImages(formData.get("existingImages"));
  const files = formData.getAll("images").filter((file) => file?.size > 0);
  const uploadedImages = await persistImageFiles(files);
  const mergedImages = normalizePrimaryImage([...existingImages, ...uploadedImages]);
  property.images = mergedImages;

  if (user.role !== ROLE.ADMIN) {
    property.status = PROPERTY_STATUS.PENDING;
  }

  await property.save();
  revalidateTag(CACHE_TAGS.PROPERTIES);
  revalidateTag(`${CACHE_TAGS.PROPERTY}-${oldSlug}`);
  revalidateTag(`${CACHE_TAGS.PROPERTY}-${property.slug}`);
  return property;
}

export async function softDeleteProperty(id, user) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  const property = await Property.findById(id);
  if (!property || property.isDeleted) throw new AppError(404, "Property not found");
  const isOwner = property.ownerId.toString() === user._id.toString();
  if (!isOwner && user.role !== ROLE.ADMIN) throw new AppError(403, "Not authorized");

  property.isDeleted = true;
  property.deletedAt = new Date();
  property.deletedBy = user._id;
  await property.save();

  revalidateTag(CACHE_TAGS.PROPERTIES);
  revalidateTag(`${CACHE_TAGS.PROPERTY}-${property.slug}`);
  return { deleted: true };
}

export async function listMyProperties(user, { page, limit, skip, status, q }) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  const filter = { ownerId: user._id, isDeleted: false };
  if (status && status !== "all") filter.status = status;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getManagePropertyById(id, user) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  const property = await Property.findById(id).lean();
  if (!property || property.isDeleted) throw new AppError(404, "Property not found");
  const isOwner = property.ownerId.toString() === user._id.toString();
  if (!isOwner && user.role !== ROLE.ADMIN) throw new AppError(403, "Not authorized");
  return property;
}

export async function saveProperty(user, propertyId) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: PROPERTY_STATUS.ACTIVE,
  }).lean();
  if (!property) throw new AppError(404, "Property not found");

  await User.updateOne({ _id: user._id }, { $addToSet: { savedProperties: propertyId } });
  revalidateTag(CACHE_TAGS.USER_DASHBOARD);
  return { saved: true };
}

export async function unsaveProperty(user, propertyId) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  await User.updateOne({ _id: user._id }, { $pull: { savedProperties: propertyId } });
  revalidateTag(CACHE_TAGS.USER_DASHBOARD);
  return { saved: false };
}

export async function listSavedProperties(user, { page, limit, skip }) {
  await connectDB();
  if (!user?._id) {
    throw new AppError(401, "Authentication required");
  }
  const account = await User.findById(user._id).select("savedProperties").lean();
  const savedIds = (account?.savedProperties || []).map((item) => item.toString());
  if (!savedIds.length) {
    return {
      items: [],
      pagination: buildPaginationMeta(0, page, limit),
    };
  }

  const filter = {
    _id: { $in: savedIds },
    isDeleted: false,
    status: PROPERTY_STATUS.ACTIVE,
  };

  const [items, total] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "name email contact")
      .lean(),
    Property.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getSavedPropertyIdSet(userId) {
  await connectDB();
  if (!userId) {
    return new Set();
  }
  const user = await User.findById(userId).select("savedProperties").lean();
  return new Set((user?.savedProperties || []).map((item) => item.toString()));
}
