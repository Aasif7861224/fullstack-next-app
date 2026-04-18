import mongoose from "mongoose";
import { ROLE } from "../lib/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: [ROLE.USER, ROLE.OWNER, ROLE.ADMIN], default: ROLE.USER },
    disabled: { type: Boolean, default: false },
    contact: { type: String, default: "" },
    address: { type: String, default: "" },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
