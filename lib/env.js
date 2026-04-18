const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""),
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  jwtExpiresInDays: toInt(process.env.JWT_EXPIRES_IN_DAYS, 7),
  mail: {
    host: process.env.MAILTRAP_HOST || "",
    port: toInt(process.env.MAILTRAP_PORT, 2525),
    user: process.env.MAILTRAP_USER || "",
    pass: process.env.MAILTRAP_PASS || "",
    from: process.env.MAIL_FROM || "no-reply@propertyapp.local",
  },
  googleMapsEmbedKey: process.env.GOOGLE_MAPS_EMBED_KEY || "",
  featuredDurationDays: toInt(process.env.FEATURED_DURATION_DAYS, 30),
};
