import Link from "next/link";

function toLabel(key, value) {
  const labels = {
    q: "Search",
    city: "City",
    minPrice: "Min",
    maxPrice: "Max",
    bhk: "BHK",
    propertyType: "Type",
    rentOrSell: "Mode",
    sort: "Sort",
  };
  return `${labels[key] || key}: ${value}`;
}

function withoutKey(query, removeKey) {
  const params = new URLSearchParams(
    Object.entries(query).filter(([key, value]) => key !== removeKey && Boolean(value))
  );
  const next = params.toString();
  return `/properties${next ? `?${next}` : ""}`;
}

export default function FilterChips({ query = {} }) {
  const entries = Object.entries(query).filter(([, value]) => Boolean(value));
  if (!entries.length) return null;

  return (
    <div className="filter-chips">
      {entries.map(([key, value]) => (
        <Link className="filter-chip" key={key} href={withoutKey(query, key)}>
          {toLabel(key, value)} ×
        </Link>
      ))}
    </div>
  );
}
