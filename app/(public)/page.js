import Link from "next/link";
import { env } from "@/lib/env";
import HeroSearch from "@/components/public/HeroSearch";
import StatsStrip from "@/components/public/StatsStrip";
import WhyChooseUs from "@/components/public/WhyChooseUs";
import TestimonialSlider from "@/components/public/TestimonialSlider";
import FeaturedPropertyGrid from "@/components/public/FeaturedPropertyGrid";
import { getCachedFirstPropertiesPage } from "@/services/publicPageService";
import { listApprovedTestimonials } from "@/services/testimonialService";
import { serializePublicProperty, serializeTestimonial } from "@/utils/serializers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find Your Dream Home | UrbanKeys",
  description: "Browse verified listings, connect with trusted sellers, and find the right home with confidence.",
  alternates: { canonical: `${env.appUrl}` },
};

export default async function HomePage() {
  const [listings, testimonials] = await Promise.all([
    getCachedFirstPropertiesPage(),
    listApprovedTestimonials(),
  ]);

  const serializedListings = listings.items.map((item) => serializePublicProperty(item));
  const serializedTestimonials = testimonials.map((item) => serializeTestimonial(item));
  const featured = serializedListings.filter((item) => item.isFeatured).slice(0, 6);
  const totalListings = listings.pagination.total || 0;
  const cityCount = new Set(serializedListings.map((item) => item.city).filter(Boolean)).size;

  return (
    <>
      <section className="hero-section" data-parallax data-parallax-depth="24">
        <div className="public-wrap hero-inner">
          <p className="hero-kicker" data-reveal>
            Trusted Real Estate Platform
          </p>
          <h1>Find Your Dream Home</h1>
          <p className="public-muted" data-reveal>
            Professional property discovery with verified listings, seller transparency, and smooth inquiry flow.
          </p>
          <div data-reveal>
            <HeroSearch />
          </div>
          <div className="public-inline-actions" data-reveal>
            <Link href="/properties" className="public-btn">
              Explore Listings
            </Link>
            <Link href="/contact" className="public-btn secondary">
              Talk to Expert
            </Link>
          </div>
        </div>
      </section>

      <section className="public-wrap" data-reveal>
        <StatsStrip total={totalListings} featured={featured.length} cities={cityCount} />
      </section>

      <section className="public-wrap" data-reveal>
        <FeaturedPropertyGrid items={featured} />
      </section>

      <section className="public-wrap" data-reveal>
        <WhyChooseUs />
      </section>

      <section className="public-wrap" data-reveal>
        <TestimonialSlider items={serializedTestimonials} />
      </section>
    </>
  );
}
