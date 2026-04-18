import { env } from "@/lib/env";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}

