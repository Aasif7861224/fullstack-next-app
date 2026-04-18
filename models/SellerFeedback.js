import mongoose from "mongoose";

const sellerFeedbackSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium", index: true },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved"],
      default: "open",
      index: true,
    },
    adminReply: { type: String, default: "" },
  },
  { timestamps: true }
);

const SellerFeedback =
  mongoose.models.SellerFeedback || mongoose.model("SellerFeedback", sellerFeedbackSchema);

export default SellerFeedback;
