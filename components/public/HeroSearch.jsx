"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const [form, setForm] = useState({
    q: "",
    city: "",
    propertyType: "",
    rentOrSell: "",
  });

  const onSubmit = (event) => {
    event.preventDefault();
    const query = new URLSearchParams(
      Object.entries(form).filter(([, value]) => Boolean(value))
    ).toString();
    router.push(`/properties${query ? `?${query}` : ""}`);
  };

  return (
    <form className="hero-search" onSubmit={onSubmit}>
      <input
        className="input"
        placeholder="Search locality, landmark, title"
        value={form.q}
        onChange={(event) => setForm((prev) => ({ ...prev, q: event.target.value }))}
      />
      <input
        className="input"
        placeholder="City"
        value={form.city}
        onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
      />
      <select
        className="select"
        value={form.propertyType}
        onChange={(event) => setForm((prev) => ({ ...prev, propertyType: event.target.value }))}
      >
        <option value="">Any Type</option>
        <option value="Flat">Flat</option>
        <option value="Villa">Villa</option>
        <option value="House">House</option>
        <option value="Plot">Plot</option>
        <option value="Other">Other</option>
      </select>
      <select
        className="select"
        value={form.rentOrSell}
        onChange={(event) => setForm((prev) => ({ ...prev, rentOrSell: event.target.value }))}
      >
        <option value="">Rent or Sell</option>
        <option value="Sell">Buy</option>
        <option value="Rent">Rent</option>
      </select>
      <button className="public-btn" type="submit">
        Search
      </button>
    </form>
  );
}
