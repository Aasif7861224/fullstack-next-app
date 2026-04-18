"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminActionButton({ url, method = "PUT", label, body = null, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onClick = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Action failed");
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button type="button" className={`admin-btn ${className}`} onClick={onClick} disabled={loading}>
        {loading ? "..." : label}
      </button>
      {error ? <p className="small" style={{ color: "#ff8f8f" }}>{error}</p> : null}
    </div>
  );
}

