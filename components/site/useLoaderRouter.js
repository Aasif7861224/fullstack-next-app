"use client";

import { useRouter } from "next/navigation";
import { useTopLoader } from "@/components/site/TopLoaderProvider";

export function useLoaderRouter() {
  const router = useRouter();
  const topLoader = useTopLoader();

  const beginNavigation = () => {
    topLoader.beginNavigation();
  };

  return {
    back: () => {
      beginNavigation();
      router.back();
    },
    forward: () => {
      beginNavigation();
      router.forward();
    },
    prefetch: (href, options) => router.prefetch(href, options),
    push: (href, options) => {
      beginNavigation();
      router.push(href, options);
    },
    replace: (href, options) => {
      beginNavigation();
      router.replace(href, options);
    },
    refresh: () => {
      router.refresh();
    },
  };
}
