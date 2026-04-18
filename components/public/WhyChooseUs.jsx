const points = [
  {
    title: "Verified Listings",
    description: "Every listing goes through seller and admin moderation before going live.",
  },
  {
    title: "Transparent Process",
    description: "Clear statuses, inquiry tracking, and data-backed property insights.",
  },
  {
    title: "Secure Platform",
    description: "Role-based authentication and controlled access for safe interactions.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="public-section">
      <div className="public-section-head" data-reveal>
        <h2>Why Choose UrbanKeys</h2>
        <p className="public-muted">Built to deliver trust, speed, and high-quality property discovery.</p>
      </div>

      <div className="trust-grid">
        {points.map((item) => (
          <article key={item.title} className="trust-card" data-reveal>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
