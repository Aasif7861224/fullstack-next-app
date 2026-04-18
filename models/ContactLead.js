import mongoose from "mongoose";

const contactLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "in_review", "resolved"],
      default: "new",
      index: true,
    },
    sourcePage: { type: String, default: "/contact" },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

contactLeadSchema.index({ status: 1, createdAt: -1 });

const ContactLead = mongoose.models.ContactLead || mongoose.model("ContactLead", contactLeadSchema);
export default ContactLead;
