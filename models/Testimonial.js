import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, default: "" },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);
export default Testimonial;

