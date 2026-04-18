"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function matchesFilter(item, status, query) {
  if (status !== "all" && item.status !== status) return false;
  if (!query) return true;
  const text = `${item.name} ${item.email} ${item.message} ${item.propertyId?.title || ""}`.toLowerCase();
  return text.includes(query.toLowerCase());
}

export default function SellerInquiriesClient({ initialItems = [], initialStatus = "all" }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () => items.filter((item) => matchesFilter(item, status, query)),
    [items, query, status]
  );

  const updateStatus = async (id, nextStatus) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/seller/inquiries/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Unable to update inquiry status");
      }
      setItems((prev) => prev.map((item) => (item._id === id ? json.data : item)));
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <div className="seller-filter-grid">
        <input
          className="input"
          placeholder="Search by name, email, property"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {error ? <p className="small" style={{ color: "#fca5a5" }}>{error}</p> : null}

      <div className="seller-table-wrap">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Property</th>
              <th>Message</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>No inquiries found.</td>
              </tr>
            ) : null}
            {filtered.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.name}</strong>
                  <p>{item.email}</p>
                  <p>{item.phone || "-"}</p>
                </td>
                <td>{item.propertyId?.title || "Property unavailable"}</td>
                <td>{item.message}</td>
                <td>
                  <span className={`status-tag ${item.status}`}>{item.status}</span>
                </td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>
                  <div className="seller-actions-inline">
                    {item.status !== "read" ? (
                      <button
                        type="button"
                        className="seller-btn small-btn ghost"
                        disabled={busyId === item._id}
                        onClick={() => updateStatus(item._id, "read")}
                      >
                        Mark Read
                      </button>
                    ) : null}
                    {item.status !== "closed" ? (
                      <button
                        type="button"
                        className="seller-btn small-btn"
                        disabled={busyId === item._id}
                        onClick={() => updateStatus(item._id, "closed")}
                      >
                        Close
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
