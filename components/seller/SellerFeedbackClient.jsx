"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerFeedbackClient({ data, status }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seller/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, priority }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Could not submit feedback");
      }
      setSubject("");
      setMessage("");
      setPriority("medium");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchStatus = (nextStatus) => {
    const query = new URLSearchParams();
    if (nextStatus !== "all") query.set("status", nextStatus);
    router.push(`/seller/feedback${query.toString() ? `?${query}` : ""}`);
  };

  return (
    <>
      <form className="seller-form-grid" onSubmit={submit}>
        <label>
          Subject
          <input
            className="input"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
            minLength={3}
          />
        </label>
        <label>
          Priority
          <select className="select" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="seller-form-full">
          Message
          <textarea
            className="textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            minLength={10}
          />
        </label>
        {error ? <p className="small" style={{ color: "#fca5a5" }}>{error}</p> : null}
        <div className="seller-form-full">
          <button className="seller-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Send to Admin"}
          </button>
        </div>
      </form>

      <div className="seller-headline" style={{ marginTop: "1rem" }}>
        <div>
          <h2>My Tickets</h2>
          <p className="small">Track admin replies and resolution status.</p>
        </div>
        <div className="seller-head-actions">
          <select className="select" value={status} onChange={(event) => switchStatus(event.target.value)}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="seller-table-wrap">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Admin Reply</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={5}>No feedback tickets found.</td>
              </tr>
            ) : null}
            {data.items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.subject}</strong>
                  <p>{item.message}</p>
                </td>
                <td>{item.priority}</td>
                <td>
                  <span className={`status-tag ${item.status === "resolved" ? "active" : "pending"}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.adminReply || "No reply yet"}</td>
                <td>{new Date(item.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
