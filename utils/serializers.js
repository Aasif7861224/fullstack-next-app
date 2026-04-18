function toPlainValue(value) {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPlainValue(item));
  }

  if (typeof value === "object") {
    if (typeof value.toHexString === "function") {
      return value.toHexString();
    }

    if (typeof value.toJSON === "function") {
      const jsonValue = value.toJSON();
      if (jsonValue !== value) {
        return toPlainValue(jsonValue);
      }
    }

    const out = {};
    Object.entries(value).forEach(([key, item]) => {
      out[key] = toPlainValue(item);
    });
    return out;
  }

  return value;
}

function toText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return `${value}`;
}

function toDateText(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function serializeId(value) {
  if (!value) return "";

  const normalized = toPlainValue(value);
  if (typeof normalized === "string" || typeof normalized === "number") {
    return `${normalized}`;
  }

  if (normalized && typeof normalized === "object") {
    if (normalized.$oid) return `${normalized.$oid}`;
    if (Array.isArray(normalized.buffer?.data)) {
      return normalized.buffer.data.map((item) => item.toString(16).padStart(2, "0")).join("");
    }
  }

  return `${value}`;
}

function serializeOwner(ownerId) {
  if (!ownerId) return null;

  const normalized = toPlainValue(ownerId);
  if (typeof normalized === "string" || typeof normalized === "number") {
    return `${normalized}`;
  }

  return {
    _id: serializeId(normalized._id),
    name: toText(normalized.name),
    email: toText(normalized.email),
    contact: toText(normalized.contact),
  };
}

export function serializeUserNav(user) {
  if (!user) return null;
  const normalized = toPlainValue(user);
  return {
    _id: serializeId(normalized._id),
    name: toText(normalized.name, "User"),
    role: toText(normalized.role, "user"),
    email: toText(normalized.email),
  };
}

export function serializePublicProperty(property) {
  const normalized = toPlainValue(property || {});
  const images = Array.isArray(normalized.images)
    ? normalized.images
        .filter((item) => item?.url)
        .map((item, index) => ({
          url: toText(item.url),
          isPrimary: Boolean(item.isPrimary),
          altText: toText(item.altText, `property image ${index + 1}`),
        }))
    : [];

  if (images.length && !images.some((item) => item.isPrimary)) {
    images[0].isPrimary = true;
  }

  return {
    _id: serializeId(normalized._id),
    title: toText(normalized.title),
    slug: toText(normalized.slug),
    location: toText(normalized.location),
    city: toText(normalized.city),
    latitude: normalized.latitude ?? null,
    longitude: normalized.longitude ?? null,
    price: Number(normalized.price || 0),
    bhk: normalized.bhk ?? null,
    propertyType: toText(normalized.propertyType),
    rentOrSell: toText(normalized.rentOrSell),
    description: toText(normalized.description),
    amenities: Array.isArray(normalized.amenities) ? normalized.amenities.map((item) => toText(item)) : [],
    images,
    ownerId: serializeOwner(normalized.ownerId),
    status: toText(normalized.status),
    views: Number(normalized.views || 0),
    isFeatured: Boolean(normalized.isFeatured),
    featuredTill: toDateText(normalized.featuredTill),
    isDeleted: Boolean(normalized.isDeleted),
    deletedAt: toDateText(normalized.deletedAt),
    deletedBy: normalized.deletedBy ? serializeId(normalized.deletedBy) : null,
    createdAt: toDateText(normalized.createdAt),
    updatedAt: toDateText(normalized.updatedAt),
    isSavedByCurrentUser: Boolean(normalized.isSavedByCurrentUser),
  };
}

export function serializeTestimonial(item) {
  const normalized = toPlainValue(item || {});
  return {
    _id: serializeId(normalized._id),
    name: toText(normalized.name, "Anonymous"),
    message: toText(normalized.message),
    rating: Number(normalized.rating || 5),
    createdAt: toDateText(normalized.createdAt),
  };
}

export function serializePagination(pagination = {}) {
  const normalized = toPlainValue(pagination);
  return {
    page: Number(normalized.page || 1),
    limit: Number(normalized.limit || 12),
    total: Number(normalized.total || 0),
    totalPages: Number(normalized.totalPages || 1),
    hasMore: Boolean(normalized.hasMore),
  };
}
