export const AUTH_COOKIE_NAME = "opl_auth";
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 50;

export const ROLE = {
  USER: "user",
  OWNER: "owner",
  ADMIN: "admin",
};

export const ROLE_LABEL = {
  [ROLE.USER]: "User",
  [ROLE.OWNER]: "Seller",
  [ROLE.ADMIN]: "Admin",
};

export const PROPERTY_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  REJECTED: "rejected",
};

export const CACHE_TAGS = {
  PROPERTIES: "properties",
  PROPERTY: "property",
  ADMIN_ANALYTICS: "admin-analytics",
  USER_DASHBOARD: "user-dashboard",
  SELLER_ANALYTICS: "seller-analytics",
  SELLER_FEEDBACK: "seller-feedback",
  CONTACT_LEADS: "contact-leads",
};
