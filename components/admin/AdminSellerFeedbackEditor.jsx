"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSellerFeedbackEditor({ id, initialStatus, initialReply }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus || "open");
  const [adminReply, setAdminReply] = useState(initialReply || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/seller-feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminReply }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Update failed");
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minWidth: "240px" }}>
      <div className="admin-actions-inline">
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <textarea
        className="textarea"
        rows={2}
        value={adminReply}
        onChange={(event) => setAdminReply(event.target.value)}
        placeholder="Admin reply"
      />
      <button type="button" className="admin-btn small-btn" onClick={submit} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
      {error ? <p className="small" style={{ color: "#ff8f8f" }}>{error}</p> : null}
    </div>
  );
}
