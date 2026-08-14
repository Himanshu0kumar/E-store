import mongoose from "mongoose";

const blogCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.BlogCategory ||
  mongoose.model("BlogCategory", blogCategorySchema);
