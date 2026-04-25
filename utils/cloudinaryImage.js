const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_SEGMENT = "/image/upload/";

const TRANSFORMS = {
  card: "f_auto,q_auto,w_500,c_fill",
  main: "f_auto,q_auto,w_600,c_fill",
  thumbnail: "f_auto,q_auto,w_150,c_fill",
};

export function isCloudinaryImageUrl(url) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.hostname === CLOUDINARY_HOST && parsed.pathname.includes(UPLOAD_SEGMENT);
  } catch {
    return false;
  }
}

export function getOptimizedCloudinaryUrl(url, variant = "card") {
  const transform = TRANSFORMS[variant] || TRANSFORMS.card;

  if (!transform || !isCloudinaryImageUrl(url)) {
    return url;
  }

  const [baseUrl, query = ""] = url.split("?");
  const markerIndex = baseUrl.indexOf(UPLOAD_SEGMENT);

  if (markerIndex === -1 || baseUrl.includes(`${UPLOAD_SEGMENT}${transform}/`)) {
    return url;
  }

  const prefix = baseUrl.slice(0, markerIndex + UPLOAD_SEGMENT.length);
  const suffix = baseUrl.slice(markerIndex + UPLOAD_SEGMENT.length);
  const optimizedUrl = `${prefix}${transform}/${suffix}`;

  return query ? `${optimizedUrl}?${query}` : optimizedUrl;
}
