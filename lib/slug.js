import slugify from "slugify";

export function buildBaseSlug(title, cityOrLocation) {
  return slugify(`${title}-${cityOrLocation || ""}`, { lower: true, strict: true, trim: true });
}

export async function generateUniqueSlug(Model, title, cityOrLocation, excludeId = null) {
  const base = buildBaseSlug(title, cityOrLocation) || `property-${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Model.findOne(query).select("_id").lean();
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

