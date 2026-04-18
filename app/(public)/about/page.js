import { env } from "@/lib/env";

export const metadata = {
  title: "About Us | UrbanKeys",
  description: "Learn how UrbanKeys delivers verified listings and trusted real estate workflows.",
  alternates: { canonical: `${env.appUrl}/about` },
};

export default function AboutPage() {
  return (
    <section className="public-wrap page-shell">
      <div className="public-section">
        <div className="public-banner about-banner" data-parallax data-parallax-depth="16">
          <div className="public-banner-content">
            <p className="hero-kicker" data-reveal>
              About UrbanKeys
            </p>
            <h1 data-reveal>Built on Trust and Verification</h1>
            <p className="public-muted" data-reveal>
              UrbanKeys combines moderation, transparent workflows, and modern UX to simplify buying, renting, and
              listing properties.
            </p>
          </div>
        </div>

        <div className="public-section-head" data-reveal>
          <h1>About UrbanKeys</h1>
          <p className="public-muted">
            UrbanKeys is a modern real estate platform focused on verified listings, secure user journeys, and clear
            seller accountability.
          </p>
        </div>

        <div className="about-grid">
          <article className="detail-card" data-reveal>
            <h3>Our Mission</h3>
            <p className="public-muted">
              Simplify property discovery with trusted information, transparent communication, and professional digital
              workflows.
            </p>
          </article>
          <article className="detail-card" data-reveal>
            <h3>Verification First</h3>
            <p className="public-muted">
              Every seller listing passes moderation checkpoints, helping users browse quality inventory with
              confidence.
            </p>
          </article>
          <article className="detail-card" data-reveal>
            <h3>User-Centric Design</h3>
            <p className="public-muted">
              We prioritize fast search, clean navigation, and mobile-first experiences inspired by top real estate
              products.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
