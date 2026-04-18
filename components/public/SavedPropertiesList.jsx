"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropertyCard from "@/components/PropertyCard";

function mergeUniqueById(previous, incoming) {
  const map = new Map(previous.map((item) => [item._id, item]));
  incoming.forEach((item) => map.set(item._id, item));
  return Array.from(map.values());
}

export default function SavedPropertiesList({ initialItems, initialPagination }) {
  const [items, setItems] = useState(initialItems);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const observerRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !pagination?.hasMore) return;
    setLoading(true);
    setError("");
    try {
      const nextPage = pagination.page + 1;
      const res = await fetch(`/api/properties/saved?page=${nextPage}&limit=${pagination.limit}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Could not load saved properties");
      }
      const prepared = json.data.items.map((item) => ({ ...item, isSavedByCurrentUser: true }));
      setItems((prev) => mergeUniqueById(prev, prepared));
      setPagination(json.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading, pagination]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.2 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleSavedChange = (propertyId, isSaved) => {
    if (!isSaved) {
      setItems((prev) => prev.filter((item) => item._id !== propertyId));
    }
  };

  if (!items.length) {
    return <p className="public-muted">No saved properties yet.</p>;
  }

  return (
    <>
      <div className="property-grid">
        {items.map((item) => (
          <PropertyCard
            key={item._id}
            property={item}
            redirectPath="/saved-properties"
            onSavedChange={(isSaved) => handleSavedChange(item._id, isSaved)}
          />
        ))}
      </div>
      {error ? <p className="public-error">{error}</p> : null}
      {loading ? <p className="public-muted">Loading...</p> : null}
      {pagination?.hasMore ? <div ref={observerRef} className="list-end-sentinel" /> : null}
    </>
  );
}
