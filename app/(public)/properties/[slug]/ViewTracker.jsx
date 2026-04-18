"use client";

import { useEffect } from "react";

export default function ViewTracker({ slug }) {
  useEffect(() => {
    const sessionKey = `viewed:${slug}`;
    if (sessionStorage.getItem(sessionKey)) return;

    fetch(`/api/properties/${slug}/view`, { method: "POST" }).catch(() => {});
    sessionStorage.setItem(sessionKey, "1");
  }, [slug]);

  return null;
}

