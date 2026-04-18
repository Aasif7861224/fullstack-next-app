function buildMapUrl(property) {
  if (property.latitude && property.longitude) {
    return `https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(
    `${property.location} ${property.city || ""}`.trim()
  )}&z=14&output=embed`;
}

export default function MapPanel({ property }) {
  return (
    <div className="detail-card">
      <h3>Location</h3>
      <iframe
        title="map"
        src={buildMapUrl(property)}
        width="100%"
        height="280"
        loading="lazy"
        style={{ border: "1px solid #d8dfeb", borderRadius: "12px" }}
      />
    </div>
  );
}
