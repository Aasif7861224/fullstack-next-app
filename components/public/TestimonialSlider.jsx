"use client";

import { useEffect, useMemo, useState } from "react";

export default function TestimonialSlider({ items = [] }) {
  const list = useMemo(() => items.slice(0, 8), [items]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [list.length]);

  if (!list.length) {
    return (
      <section className="public-section">
        <div className="public-section-head" data-reveal>
          <h2>Client Testimonials</h2>
        </div>
        <p className="public-muted">No approved testimonials yet.</p>
      </section>
    );
  }

  const current = list[index];
  return (
    <section className="public-section">
      <div className="public-section-head" data-reveal>
        <h2>Client Testimonials</h2>
        <p className="public-muted">Real experiences from buyers and renters.</p>
      </div>

      <article className="testimonial-slider-card testimonial-fade" key={`${current._id}-${index}`} data-reveal>
        <p>&quot;{current.message}&quot;</p>
        <div className="testimonial-slider-meta">
          <strong>{current.name || "Anonymous"}</strong>
          <span>Rating {current.rating}/5</span>
        </div>
      </article>

      <div className="testimonial-dots">
        {list.map((item, dotIndex) => (
          <button
            type="button"
            key={`${item._id}-${dotIndex}`}
            className={dotIndex === index ? "active" : ""}
            onClick={() => setIndex(dotIndex)}
            aria-label={`Open testimonial ${dotIndex + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
