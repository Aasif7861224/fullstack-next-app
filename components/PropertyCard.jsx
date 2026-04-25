import Image from "next/image";
import Link from "next/link";
import SavePropertyButton from "@/components/public/SavePropertyButton";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinaryImage";

export default function PropertyCard({
  property,
  redirectPath = "/properties",
  showSave = true,
  compact = false,
  onSavedChange = null,
}) {
  const propertyId = property?._id ? `${property._id}` : "";
  const primaryImage = property.images?.find((img) => img.isPrimary) || property.images?.[0];
  const imageSrc = getOptimizedCloudinaryUrl(primaryImage?.url || "/window.svg", "card");

  return (
    <article className={`property-card ${compact ? "compact" : ""}`} data-reveal>
      <div className="property-card-media">
        <Image
          src={imageSrc}
          alt={primaryImage?.altText || property.title}
          fill
          sizes={compact ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, 25vw"}
        />
        {property.isFeatured ? <span className="property-badge">Featured</span> : null}
      </div>

      <div className="property-card-body">
        <h3>{property.title}</h3>
        <p className="property-card-meta">
          {property.city || property.location} | {property.rentOrSell}
        </p>
        <p className="property-card-price">INR {property.price}</p>
        <p className="property-card-meta">
          {property.bhk ? `${property.bhk} BHK` : "Type: N/A"} | Views {property.views || 0}
        </p>

        <div className="property-card-actions">
          <Link href={`/properties/${property.slug}`} className="public-btn">
            View Details
          </Link>
          {showSave ? (
            <SavePropertyButton
              propertyId={propertyId}
              initialSaved={property.isSavedByCurrentUser}
              redirectPath={redirectPath}
              onSavedChange={onSavedChange}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
