import { env } from "@/lib/env";
import connectDB from "@/lib/db";
import Property from "@/models/Property";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  await connectDB();
  const properties = await Property.find({ isDeleted: false, status: "active" })
    .select("slug updatedAt")
    .limit(5000)
    .lean();

  const routes = [
    { url: env.appUrl, lastModified: new Date() },
    { url: `${env.appUrl}/properties`, lastModified: new Date() },
    { url: `${env.appUrl}/about`, lastModified: new Date() },
    { url: `${env.appUrl}/contact`, lastModified: new Date() },
    { url: `${env.appUrl}/testimonials`, lastModified: new Date() },
    { url: `${env.appUrl}/saved-properties`, lastModified: new Date() },
    { url: `${env.appUrl}/login`, lastModified: new Date() },
  ];

  const propertyRoutes = properties.map((item) => ({
    url: `${env.appUrl}/properties/${item.slug}`,
    lastModified: item.updatedAt || new Date(),
  }));

  return [...routes, ...propertyRoutes];
}
