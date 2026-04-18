"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function InquiryForm({ propertyId }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, propertyId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to send inquiry");
      }
      setStatus("Inquiry sent successfully.");
      setForm(initialForm);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="detail-card inquiry-form">
      <h3>Contact Seller</h3>
      <input
        className="input"
        required
        placeholder="Name"
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
      />
      <input
        className="input"
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
      />
      <input
        className="input"
        placeholder="Phone"
        value={form.phone}
        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
      />
      <textarea
        className="textarea"
        required
        placeholder="Message"
        value={form.message}
        onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
      />
      <button type="submit" className="public-btn" disabled={loading}>
        {loading ? "Sending..." : "Send Inquiry"}
      </button>
      {status ? <p className="public-muted">{status}</p> : null}
    </form>
  );
}
