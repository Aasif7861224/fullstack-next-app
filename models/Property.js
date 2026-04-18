import mongoose from "mongoose";
import { PROPERTY_STATUS } from "../lib/constants.js";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    altText: { type: String, default: "property image" },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true, index: true },
    latitude: { type: Number },
    longitude: { type: Number },
    price: { type: Number, required: true, min: 0, index: true },
    bhk: { type: Number, min: 1 },
    propertyType: {
      type: String,
      enum: ["Flat", "Plot", "Villa", "House", "Other"],
      default: "Flat",
    },
    rentOrSell: { type: String, enum: ["Rent", "Sell"], required: true, index: true },
    description: { type: String, default: "" },
    amenities: [{ type: String }],
    images: [imageSchema],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: [PROPERTY_STATUS.PENDING, PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.REJECTED],
      default: PROPERTY_STATUS.PENDING,
      index: true,
    },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredTill: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

propertySchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
propertySchema.index({ isDeleted: 1, isFeatured: 1, featuredTill: -1 });

const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);
export default Property;
