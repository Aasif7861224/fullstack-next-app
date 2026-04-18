import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "read", "closed"], default: "new", index: true },
    ownerEmailSent: { type: Boolean, default: false },
    senderEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
export default Inquiry;

