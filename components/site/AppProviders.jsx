"use client";

import { TopLoaderProvider } from "@/components/site/TopLoaderProvider";

export default function AppProviders({ children }) {
  return <TopLoaderProvider>{children}</TopLoaderProvider>;
}
