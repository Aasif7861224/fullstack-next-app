"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropertyCard from "@/components/PropertyCard";

function mergeUniqueById(previous, incoming) {
  const map = new Map(previous.map((item) => [item._id, item]));
  incoming.forEach((item) => map.set(item._id, item));
  return Array.from(map.values());
}

function LoadingSkeleton() {
  return (
    <div className="property-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="property-skeleton" key={`skeleton-${index}`} />
      ))}
    </div>
  );
}

export default function PropertyInfiniteList({
  initialItems,
  initialPagination,
  queryString = "",
  endpoint = "/api/properties",
  redirectPath = "/properties",
}) {
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
      const glue = queryString ? `${queryString}&` : "";
      const res = await fetch(`${endpoint}?${glue}page=${nextPage}&limit=${pagination.limit}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load more listings");
      }
      setItems((prev) => mergeUniqueById(prev, json.data.items));
      setPagination(json.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, loading, pagination, queryString]);

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

  return (
    <>
      <div className="property-grid">
        {items.map((item) => (
          <PropertyCard key={item._id} property={item} redirectPath={redirectPath} />
        ))}
      </div>

      {error ? <p className="public-error">{error}</p> : null}
      {loading ? <LoadingSkeleton /> : null}
      {pagination?.hasMore ? <div ref={observerRef} className="list-end-sentinel" /> : <p className="public-muted">End of results</p>}
    </>
  );
}
