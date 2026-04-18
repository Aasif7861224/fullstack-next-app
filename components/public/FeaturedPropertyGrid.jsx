import PropertyCard from "@/components/PropertyCard";

export default function FeaturedPropertyGrid({ items = [] }) {
  return (
    <section className="public-section">
      <div className="public-section-head" data-reveal>
        <h2>Featured Properties</h2>
        <p className="public-muted">Curated homes and investment opportunities selected for priority visibility.</p>
      </div>
      {items.length === 0 ? (
        <p className="public-muted">No featured properties available right now.</p>
      ) : (
        <div className="property-grid">
          {items.map((item) => (
            <div key={item._id} data-reveal>
              <PropertyCard property={item} compact />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
