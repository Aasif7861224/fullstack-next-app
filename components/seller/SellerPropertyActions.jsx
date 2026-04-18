"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerPropertyActions({ propertyId, isFeatured, featuredTill }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const runDelete = async () => {
    if (!window.confirm("Delete this listing? It will be removed from public results.")) return;
    setBusy("delete");
    setError("");
    try {
      const res = await fetch(`/api/properties/manage/${propertyId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const runFeature = async () => {
    setBusy("feature");
    setError("");
    try {
      const orderRes = await fetch("/api/payments/feature/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson.success) {
        throw new Error(orderJson.message || "Could not create feature order");
      }

      const verifyRes = await fetch("/api/payments/feature/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderJson.data.orderId,
          paymentId: `demo_pay_${Date.now()}`,
        }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson.success) {
        throw new Error(verifyJson.message || "Feature activation failed");
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const featuredActive = Boolean(isFeatured && featuredTill && new Date(featuredTill) >= new Date());

  return (
    <div>
      <div className="seller-actions-inline">
        <button type="button" className="seller-btn small-btn ghost" onClick={runDelete} disabled={busy === "delete"}>
          {busy === "delete" ? "Deleting..." : "Delete"}
        </button>
        {!featuredActive ? (
          <button type="button" className="seller-btn small-btn" onClick={runFeature} disabled={busy === "feature"}>
            {busy === "feature" ? "Processing..." : "Feature (Demo Pay)"}
          </button>
        ) : (
          <span className="status-tag active">featured</span>
        )}
      </div>
      {error ? <p className="small" style={{ color: "#fca5a5" }}>{error}</p> : null}
    </div>
  );
}
