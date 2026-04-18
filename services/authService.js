import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { AppError } from "@/utils/errors";
import { ROLE } from "@/lib/constants";

export async function registerUser(payload) {
  await connectDB();
  const existing = await User.findOne({ email: payload.email.toLowerCase() }).lean();
  if (existing) {
    throw new AppError(409, "User already exists");
  }
  const requiresApproval = payload.role === ROLE.OWNER;
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash,
    role: payload.role || ROLE.USER,
    disabled: requiresApproval,
    contact: payload.contact || "",
    address: payload.address || "",
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    requiresApproval,
  };
}

export async function loginUser(payload) {
  await connectDB();
  const user = await User.findOne({ email: payload.email.toLowerCase() }).select("+passwordHash");
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }
  if (user.disabled) {
    throw new AppError(403, "User account is disabled");
  }
  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
