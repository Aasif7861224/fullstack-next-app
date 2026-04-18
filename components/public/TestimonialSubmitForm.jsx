"use client";

import { useState } from "react";

const initial = {
  name: "",
  message: "",
  rating: 5,
};

export default function TestimonialSubmitForm() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit testimonial");
      }
      setStatus("Thanks. Your testimonial is submitted for admin approval.");
      setForm(initial);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="public-form-card" onSubmit={onSubmit}>
      <h3>Share your experience</h3>
      <input
        className="input"
        placeholder="Name"
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
      />
      <select
        className="select"
        value={form.rating}
        onChange={(event) => setForm((prev) => ({ ...prev, rating: Number(event.target.value) }))}
      >
        <option value={5}>5 - Excellent</option>
        <option value={4}>4 - Very Good</option>
        <option value={3}>3 - Good</option>
        <option value={2}>2 - Fair</option>
        <option value={1}>1 - Poor</option>
      </select>
      <textarea
        className="textarea"
        placeholder="Your testimonial"
        value={form.message}
        onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
        required
      />
      <button className="public-btn" type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Testimonial"}
      </button>
      {status ? <p className="public-muted">{status}</p> : null}
    </form>
  );
}
