import { env } from "@/lib/env";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { getServerSessionUser } from "@/lib/auth";
import { getSavedPropertyIdSet, listPublicProperties } from "@/services/propertyService";
import FilterChips from "@/components/public/FilterChips";
import FilterSidebar, { SortBar } from "@/components/public/FilterSidebar";
import PropertyInfiniteList from "@/components/PropertyInfiniteList";
import { serializeId, serializePagination, serializePublicProperty } from "@/utils/serializers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Property Listings | UrbanKeys",
  description: "Search, filter, and explore verified properties for rent and sale.",
  alternates: { canonical: `${env.appUrl}/properties` },
};

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams;
  const query = {
    q: params.q || "",
    city: params.city || "",
    minPrice: params.minPrice || "",
    maxPrice: params.maxPrice || "",
    bhk: params.bhk || "",
    propertyType: params.propertyType || "",
    rentOrSell: params.rentOrSell || "",
    sort: params.sort || "",
  };

  const [data, user] = await Promise.all([
    listPublicProperties({
      page: 1,
      limit: DEFAULT_LIMIT,
      skip: 0,
      query,
    }),
    getServerSessionUser(),
  ]);

  let savedIdSet = new Set();
  if (user?._id) {
    savedIdSet = await getSavedPropertyIdSet(user._id);
  }

  const initialItems = data.items.map((item) => {
    const serialized = serializePublicProperty(item);
    return {
      ...serialized,
      isSavedByCurrentUser: savedIdSet.has(serializeId(item._id)),
    };
  });
  const initialPagination = serializePagination(data.pagination);

  return (
    <section className="public-wrap page-shell">
      <div className="public-section-head" data-reveal>
        <h1>Property Listings</h1>
        <p className="public-muted">Filter by budget, city, and property type to find the right fit quickly.</p>
      </div>

      <div className="listing-layout">
        <div data-reveal>
          <FilterSidebar query={query} sort={query.sort} />
        </div>
        <div data-reveal>
          <SortBar sort={query.sort} query={query} />
          <FilterChips query={query} />
          <PropertyInfiniteList
            initialItems={initialItems}
            initialPagination={initialPagination}
            queryString={new URLSearchParams(
              Object.entries(query).filter(([, value]) => Boolean(value))
            ).toString()}
            redirectPath="/properties"
          />
        </div>
      </div>
    </section>
  );
}
