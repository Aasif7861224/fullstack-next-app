import { env } from "@/lib/env";
import { listApprovedTestimonials } from "@/services/testimonialService";
import TestimonialSubmitForm from "@/components/public/TestimonialSubmitForm";
import { serializeTestimonial } from "@/utils/serializers";

export const metadata = {
  title: "Testimonials | UrbanKeys",
  description: "Read verified client testimonials and share your experience with UrbanKeys.",
  alternates: { canonical: `${env.appUrl}/testimonials` },
};

export default async function TestimonialsPage() {
  const items = (await listApprovedTestimonials()).map((item) => serializeTestimonial(item));
  return (
    <section className="public-wrap page-shell">
      <div className="public-section">
        <div className="public-section-head" data-reveal>
          <h1>Testimonials</h1>
          <p className="public-muted">See what our users say about buying, renting, and listing with UrbanKeys.</p>
        </div>

        <div className="testimonials-layout">
          <div className="testimonial-wall">
            {items.length === 0 ? (
              <p className="public-muted">No approved testimonials yet.</p>
            ) : null}
            {items.map((item) => (
              <article className="testimonial-card" key={item._id} data-reveal>
                <p>&quot;{item.message}&quot;</p>
                <div>
                  <strong>{item.name || "Anonymous"}</strong>
                  <span>Rating {item.rating}/5</span>
                </div>
              </article>
            ))}
          </div>

          <div data-reveal>
            <TestimonialSubmitForm />
          </div>
        </div>
      </div>
    </section>
  );
}
