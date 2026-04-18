export default function ListingsLoading() {
  return (
    <section className="public-wrap page-shell">
      <div className="public-section">
        <div className="property-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="property-skeleton" />
          ))}
        </div>
      </div>
    </section>
  );
}
