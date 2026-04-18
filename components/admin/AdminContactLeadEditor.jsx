"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminContactLeadEditor({ id, initialStatus, initialNote }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus || "new");
  const [adminNote, setAdminNote] = useState(initialNote || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/contact-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update lead");
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minWidth: "230px" }}>
      <div className="admin-actions-inline">
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <textarea
        className="textarea"
        rows={2}
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
        placeholder="Admin note"
      />
      <button type="button" className="admin-btn small-btn" onClick={save} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
      {error ? <p className="small" style={{ color: "#ff8f8f" }}>{error}</p> : null}
    </div>
  );
}
