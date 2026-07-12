import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subDescription: { type: String },
    description: { type: String, required: true }, // maps to your editor `content`
    images: { type: [String], default: [] },

    productCode: { type: String },
    productSKU: { type: String },
    quantity: { type: Number, default: 0 },
    category: { type: String, required: true },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    tags: { type: String },

    gender: {
      men: { type: Boolean, default: false },
      women: { type: Boolean, default: false },
      kids: { type: Boolean, default: false },
    },

    saleLabel: {
      enabled: { type: Boolean, default: false },
      value: { type: String, default: "" },
    },
    newLabel: {
      enabled: { type: Boolean, default: false },
      value: { type: String, default: "" },
    },

    regularPrice: { type: Number, required: true },
    salePrice: { type: Number },
    priceIncludesTaxes: { type: Boolean, default: false },
    tax: { type: Number, default: 0 },

    publish: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);