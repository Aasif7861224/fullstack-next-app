export default function StatsStrip({ total = 0, featured = 0, cities = 0 }) {
  return (
    <section className="stats-strip">
      <div>
        <strong>{total}</strong>
        <span>Active Listings</span>
      </div>
      <div>
        <strong>{featured}</strong>
        <span>Featured Homes</span>
      </div>
      <div>
        <strong>{cities}</strong>
        <span>Cities Covered</span>
      </div>
      <div>
        <strong>24/7</strong>
        <span>Support Team</span>
      </div>
    </section>
  );
}
