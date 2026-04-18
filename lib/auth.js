import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { verifyJwt } from "@/lib/jwt";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { AppError } from "@/utils/errors";

export async function getAuthUserFromRequest(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) throw new AppError(401, "Authentication required");
  let payload;
  try {
    payload = verifyJwt(token);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
  await connectDB();
  const user = await User.findById(payload.id).select("-passwordHash");
  if (!user || user.disabled) throw new AppError(401, "Unauthorized user");
  return user;
}

export async function getOptionalAuthUserFromRequest(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = verifyJwt(token);
    await connectDB();
    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user || user.disabled) return null;
    return user;
  } catch {
    return null;
  }
}

export function requireRole(user, roles) {
  if (!roles.includes(user.role)) {
    throw new AppError(403, "Forbidden");
  }
}

export async function getServerSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = verifyJwt(token);
    await connectDB();
    const user = await User.findById(payload.id).select("-passwordHash").lean();
    if (!user || user.disabled) return null;
    return user;
  } catch {
    return null;
  }
}
