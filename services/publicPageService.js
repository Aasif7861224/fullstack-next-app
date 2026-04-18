import { unstable_cache } from "next/cache";
import { CACHE_TAGS, DEFAULT_LIMIT } from "@/lib/constants";
import { getPropertyBySlug, listPublicProperties } from "@/services/propertyService";

export const getCachedFirstPropertiesPage = unstable_cache(
  async () => {
    return listPublicProperties({
      page: 1,
      limit: DEFAULT_LIMIT,
      skip: 0,
      query: {},
    });
  },
  ["public-properties-first-page"],
  {
    tags: [CACHE_TAGS.PROPERTIES],
    revalidate: 120,
  }
);

export function getCachedPropertyDetails(slug) {
  return unstable_cache(
    async () => getPropertyBySlug(slug),
    [`property-${slug}`],
    {
      tags: [`${CACHE_TAGS.PROPERTY}-${slug}`, CACHE_TAGS.PROPERTIES],
      revalidate: 120,
    }
  )();
}

