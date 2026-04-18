import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    purpose: { type: String, enum: ["feature_listing"], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, default: null },
    status: { type: String, enum: ["initiated", "paid", "failed"], default: "initiated", index: true },
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;

