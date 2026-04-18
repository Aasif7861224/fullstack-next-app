"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactLeadForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/contact-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sourcePage: "/contact" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const nextFieldErrors = json?.details?.fieldErrors || {};
        setFieldErrors(
          Object.fromEntries(
            Object.entries(nextFieldErrors).map(([field, messages]) => [
              field,
              Array.isArray(messages) ? messages[0] : "",
            ])
          )
        );
        setStatus(json.message || "Unable to send message");
        return;
      }
      setStatus("Thanks. Our team has received your message.");
      setForm(initialForm);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <form className="public-form-card" onSubmit={onSubmit}>
      <h3>Send us a message</h3>
      <input
        className="input"
        placeholder="Name"
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        minLength={2}
        maxLength={80}
        required
      />
      {fieldErrors.name ? <p className="public-field-error">{fieldErrors.name}</p> : null}
      <input
        className="input"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        maxLength={160}
        required
      />
      {fieldErrors.email ? <p className="public-field-error">{fieldErrors.email}</p> : null}
      <input
        className="input"
        placeholder="Phone"
        value={form.phone}
        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        maxLength={30}
      />
      {fieldErrors.phone ? <p className="public-field-error">{fieldErrors.phone}</p> : null}
      <input
        className="input"
        placeholder="Subject"
        value={form.subject}
        onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
        minLength={3}
        maxLength={140}
        required
      />
      {fieldErrors.subject ? <p className="public-field-error">{fieldErrors.subject}</p> : null}
      <textarea
        className="textarea"
        placeholder="Message"
        value={form.message}
        onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
        minLength={8}
        maxLength={4000}
        required
      />
      {fieldErrors.message ? <p className="public-field-error">{fieldErrors.message}</p> : null}
      <button className="public-btn" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Submit"}
      </button>
      {status ? <p className={hasFieldErrors ? "public-error" : "public-success"}>{status}</p> : null}
    </form>
  );
}
