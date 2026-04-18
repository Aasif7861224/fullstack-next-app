import { revalidateTag } from "next/cache";
import { connectDb } from "@/lib/db";
import Property from "@/models/Property";
import User from "@/models/User";
import { AppError } from "@/utils/errors";
import { generateUniqueSlug } from "@/lib/slug";
import { buildPaginationMeta } from "@/lib/pagination";
import { CACHE_TAGS, PROPERTY_STATUS, ROLE } from "@/lib/constants";
import { persistImageFiles } from "@/utils/fileUpload";

function parseAmenities(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => `${item}`.trim()).filter(Boolean);
  } catch {
    return `${value}`
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
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

export async function expireFeaturedListings() {
  await connectDb();
  await Property.updateMany(
    { isFeatured: true, featuredTill: { $lt: new Date() } },
    { $set: { isFeatured: false }, $unset: { featuredTill: 1 } }
  );
}

export async function listPublicProperties({ page, limit, skip, query }) {
  await connectDb();
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
  if (query.bhk) filter.bhk = Number(query.bhk);
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
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
  await connectDb();
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
  await connectDb();
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
  await connectDb();
  const updated = await Property.findOneAndUpdate(
    { slug, isDeleted: false, status: PROPERTY_STATUS.ACTIVE },
    { $inc: { views: 1 } },
    { new: true, projection: { views: 1, slug: 1 } }
  ).lean();
  if (!updated) throw new AppError(404, "Property not found");
  return updated;
}

export async function createPropertyFromForm(formData, user) {
  await connectDb();
  if (![ROLE.OWNER, ROLE.ADMIN].includes(user.role)) {
    throw new AppError(403, "Only owners/admin can create properties");
  }

  const title = `${formData.get("title") || ""}`.trim();
  const location = `${formData.get("location") || ""}`.trim();
  const city = `${formData.get("city") || ""}`.trim();
  const price = Number(formData.get("price"));
  const rentOrSell = `${formData.get("rentOrSell") || ""}`.trim();
  const propertyType = `${formData.get("propertyType") || "Flat"}`.trim();
  const description = `${formData.get("description") || ""}`.trim();
  const bhkRaw = formData.get("bhk");
  const bhk = bhkRaw ? Number(bhkRaw) : undefined;
  const latRaw = formData.get("latitude");
  const lngRaw = formData.get("longitude");
  const latitude = latRaw ? Number(latRaw) : undefined;
  const longitude = lngRaw ? Number(lngRaw) : undefined;
  const amenities = parseAmenities(formData.get("amenities"));

  if (!title || !location || !price || !rentOrSell) {
    throw new AppError(400, "title, location, price, rentOrSell are required");
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError(400, "price must be positive");
  }

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
  await connectDb();
  const property = await Property.findById(id);
  if (!property || property.isDeleted) throw new AppError(404, "Property not found");
  const isOwner = property.ownerId.toString() === user._id.toString();
  if (!isOwner && user.role !== ROLE.ADMIN) throw new AppError(403, "Not authorized");

  const title = formData.get("title");
  const location = formData.get("location");
  const city = formData.get("city");
  const price = formData.get("price");
  const rentOrSell = formData.get("rentOrSell");
  const propertyType = formData.get("propertyType");
  const description = formData.get("description");
  const bhk = formData.get("bhk");
  const latitude = formData.get("latitude");
  const longitude = formData.get("longitude");
  const amenitiesRaw = formData.get("amenities");

  if (title !== null) property.title = `${title}`.trim();
  if (location !== null) property.location = `${location}`.trim();
  if (city !== null) property.city = `${city}`.trim();
  if (price !== null) property.price = Number(price);
  if (rentOrSell !== null) property.rentOrSell = `${rentOrSell}`.trim();
  if (propertyType !== null) property.propertyType = `${propertyType}`.trim();
  if (description !== null) property.description = `${description}`.trim();
  if (bhk !== null) property.bhk = Number(bhk);
  if (latitude !== null) property.latitude = Number(latitude);
  if (longitude !== null) property.longitude = Number(longitude);
  if (amenitiesRaw !== null) property.amenities = parseAmenities(amenitiesRaw);

  if (title !== null || city !== null || location !== null) {
    property.slug = await generateUniqueSlug(
      Property,
      property.title,
      property.city || property.location,
      property._id
    );
  }

  const existingImages = parseExistingImages(formData.get("existingImages"));
  const files = formData.getAll("images").filter((file) => file?.size > 0);
  const uploadedImages = await persistImageFiles(files);
  const mergedImages = normalizePrimaryImage([...existingImages, ...uploadedImages]);
  if (mergedImages.length) property.images = mergedImages;

  if (user.role !== ROLE.ADMIN) {
    property.status = PROPERTY_STATUS.PENDING;
  }

  await property.save();
  revalidateTag(CACHE_TAGS.PROPERTIES);
  revalidateTag(`${CACHE_TAGS.PROPERTY}-${property.slug}`);
  return property;
}

export async function softDeleteProperty(id, user) {
  await connectDb();
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
  await connectDb();
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
  await connectDb();
  const property = await Property.findById(id).lean();
  if (!property || property.isDeleted) throw new AppError(404, "Property not found");
  const isOwner = property.ownerId.toString() === user._id.toString();
  if (!isOwner && user.role !== ROLE.ADMIN) throw new AppError(403, "Not authorized");
  return property;
}

export async function saveProperty(user, propertyId) {
  await connectDb();
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
  await connectDb();
  await User.updateOne({ _id: user._id }, { $pull: { savedProperties: propertyId } });
  revalidateTag(CACHE_TAGS.USER_DASHBOARD);
  return { saved: false };
}

export async function listSavedProperties(user, { page, limit, skip }) {
  await connectDb();
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
  await connectDb();
  const user = await User.findById(userId).select("savedProperties").lean();
  return new Set((user?.savedProperties || []).map((item) => item.toString()));
}
