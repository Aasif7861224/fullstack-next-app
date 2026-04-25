"use client";

import { useState } from "react";
import { useLoaderRouter } from "@/components/site/useLoaderRouter";

export default function SavePropertyButton({
  propertyId,
  initialSaved = false,
  redirectPath = "/saved-properties",
  onSavedChange = null,
  className = "",
}) {
  const router = useLoaderRouter();
  const [saved, setSaved] = useState(Boolean(initialSaved));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/properties/manage/${propertyId}/save`, {
        method: saved ? "DELETE" : "POST",
      });

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        return;
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Unable to update saved state");
      }

      const next = !saved;
      setSaved(next);
      setMessage(next ? "Saved" : "Removed");
      if (onSavedChange) onSavedChange(next);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`save-btn-wrap ${className}`}>
      <button type="button" className={`save-btn ${saved ? "active" : ""}`} onClick={toggleSave} disabled={loading}>
        {loading ? "..." : saved ? "Saved" : "Save"}
      </button>
      {message ? <small>{message}</small> : null}
    </div>
  );
}
