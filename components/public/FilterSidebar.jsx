function HiddenInputs({ query }) {
  const hidden = {
    q: query.q,
    city: query.city,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    bhk: query.bhk,
    propertyType: query.propertyType,
    rentOrSell: query.rentOrSell,
  };
  return Object.entries(hidden)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => <input type="hidden" name={key} value={value} key={key} />);
}

export default function FilterSidebar({ query = {}, sort = "" }) {
  return (
    <aside className="filter-sidebar">
      <h3>Filters</h3>
      <form className="filter-form" method="GET">
        <label>
          Search
          <input className="input" name="q" defaultValue={query.q || ""} placeholder="Title, city, locality" />
        </label>
        <label>
          City
          <input className="input" name="city" defaultValue={query.city || ""} />
        </label>
        <label>
          Min Price
          <input className="input" type="number" name="minPrice" defaultValue={query.minPrice || ""} />
        </label>
        <label>
          Max Price
          <input className="input" type="number" name="maxPrice" defaultValue={query.maxPrice || ""} />
        </label>
        <label>
          Bedrooms
          <select className="select" name="bhk" defaultValue={query.bhk || ""}>
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </label>
        <label>
          Property Type
          <select className="select" name="propertyType" defaultValue={query.propertyType || ""}>
            <option value="">Any Type</option>
            <option value="Flat">Flat</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label>
          Rent / Sell
          <select className="select" name="rentOrSell" defaultValue={query.rentOrSell || ""}>
            <option value="">Any</option>
            <option value="Sell">Sell</option>
            <option value="Rent">Rent</option>
          </select>
        </label>
        {sort ? <input type="hidden" name="sort" value={sort} /> : null}
        <button className="public-btn" type="submit">
          Apply Filters
        </button>
      </form>

      <form method="GET" style={{ marginTop: "0.75rem" }}>
        <button type="submit" className="public-btn secondary">
          Clear
        </button>
      </form>
    </aside>
  );
}

export function SortBar({ sort = "", query = {} }) {
  return (
    <form method="GET" className="sort-bar">
      <HiddenInputs query={query} />
      <label>
        Sort
        <select className="select" name="sort" defaultValue={sort}>
          <option value="">Newest</option>
          <option value="price_asc">Price Low to High</option>
          <option value="price_desc">Price High to Low</option>
          <option value="views_desc">Most Viewed</option>
          <option value="featured">Featured First</option>
        </select>
      </label>
      <button type="submit" className="public-btn secondary">
        Update
      </button>
    </form>
  );
}
