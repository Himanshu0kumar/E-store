import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    category: { type: String, required: true, default: "General" },
    tags: [{ type: String, trim: true }],
    author: {
      name: { type: String, default: "Admin" },
      role: { type: String, default: "Editor" },
      avatar: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    featured: { type: Boolean, default: false },
    readTime: { type: Number, default: 5 },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.BlogPost ||
  mongoose.model("BlogPost", blogPostSchema);
