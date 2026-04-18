export default function SavedPropertiesLoading() {
  return (
    <section className="public-wrap page-shell">
      <div className="public-section">
        <div className="property-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="property-skeleton" />
          ))}
        </div>
      </div>
    </section>
  );
}
