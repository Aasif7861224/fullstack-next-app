import { notFound } from "next/navigation";
import Link from "next/link";
import { env } from "@/lib/env";
import { getServerSessionUser } from "@/lib/auth";
import { getCachedPropertyDetails } from "@/services/publicPageService";
import { getSavedPropertyIdSet, listRelatedProperties } from "@/services/propertyService";
import ViewTracker from "@/app/(public)/properties/[slug]/ViewTracker";
import PropertyCard from "@/components/PropertyCard";
import InquiryForm from "@/components/InquiryForm";
import ImageGallery from "@/components/public/ImageGallery";
import MapPanel from "@/components/public/MapPanel";
import SavePropertyButton from "@/components/public/SavePropertyButton";
import { serializeId, serializePublicProperty } from "@/utils/serializers";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const property = await getCachedPropertyDetails(slug);
    return {
      title: `${property.title} | UrbanKeys`,
      description: property.description || `Property in ${property.city || property.location}`,
      alternates: { canonical: `${env.appUrl}/properties/${property.slug}` },
      openGraph: {
        title: property.title,
        description: property.description || "Property listing details",
        images: property.images?.[0]?.url ? [`${env.appUrl}${property.images[0].url}`] : [],
      },
    };
  } catch {
    return { title: "Property not found" };
  }
}

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params;
  let property = null;
  try {
    property = await getCachedPropertyDetails(slug);
  } catch {
    notFound();
  }

  const [user, related] = await Promise.all([
    getServerSessionUser(),
    listRelatedProperties(property, 4),
  ]);
  const serializedProperty = serializePublicProperty(property);
  const propertyId = serializeId(serializedProperty._id);

  let isSaved = false;
  if (user?._id) {
    const savedSet = await getSavedPropertyIdSet(user._id);
    isSaved = savedSet.has(propertyId);
  }

  const serializedRelated = related.map((item) => serializePublicProperty(item));

  return (
    <section className="public-wrap page-shell">
      <ViewTracker slug={slug} />
      <div className="detail-header" data-reveal>
        <div>
          <h1>{property.title}</h1>
          <p className="public-muted">
            {property.city || property.location} - {property.rentOrSell} - INR {property.price}
          </p>
          {property.isFeatured && property.featuredTill ? (
            <p className="public-muted">Featured till {new Date(property.featuredTill).toLocaleDateString()}</p>
          ) : null}
        </div>
        <SavePropertyButton propertyId={propertyId} initialSaved={isSaved} redirectPath={`/properties/${slug}`} />
      </div>

      <div className="detail-layout">
        <div data-reveal>
          <ImageGallery images={serializedProperty.images || []} title={property.title} />

          <div className="detail-card">
            <h3>Overview</h3>
            <p className="public-muted">{property.description || "No description available."}</p>
            <div className="detail-meta-grid">
              <p>
                <strong>Type:</strong> {property.propertyType || "N/A"}
              </p>
              <p>
                <strong>BHK:</strong> {property.bhk || "N/A"}
              </p>
              <p>
                <strong>Views:</strong> {property.views || 0}
              </p>
              <p>
                <strong>Status:</strong> {property.status}
              </p>
            </div>
          </div>

          <div className="detail-card">
            <h3>Amenities</h3>
            {property.amenities?.length ? (
              <ul className="amenities-list">
                {property.amenities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="public-muted">No amenities listed.</p>
            )}
          </div>

          <MapPanel property={property} />
        </div>

        <aside className="detail-side" data-reveal>
          <InquiryForm propertyId={propertyId} />
          <div className="detail-card sticky-mobile-cta">
            <p className="public-muted">Need quick help with this property?</p>
            <Link href="/contact" className="public-btn">
              Request Callback
            </Link>
          </div>
        </aside>
      </div>

      <div className="public-section" data-reveal>
        <div className="public-section-head" data-reveal>
          <h2>Related Properties</h2>
        </div>
        {serializedRelated.length ? (
          <div className="property-grid">
            {serializedRelated.map((item) => (
              <div key={item._id} data-reveal>
                <PropertyCard property={item} redirectPath={`/properties/${slug}`} />
              </div>
            ))}
          </div>
        ) : (
          <p className="public-muted">No related properties found.</p>
        )}
      </div>
    </section>
  );
}
