import mongoose from "mongoose";

// One attribute axis, e.g. { name: "Color", values: ["Red","Blue","Black"] }
const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    values: { type: [String], default: [] },
  },
  { _id: false }
);


const variantSchema = new mongoose.Schema(
  {
    combination: {
      type: Map,
      of: String,
      required: true,
    },
    sku: { type: String, trim: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    stock: { type: Number, default: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subDescription: { type: String },
    description: { type: String, required: true }, 
    images: { type: [String], default: [] },

    productCode: { type: String },
    productSKU: { type: String },
    quantity: { type: Number, default: 0 },
    category: { type: String, required: true },
    brand: { type: String },
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

    
    hasVariants: { type: Boolean, default: false },
    attributes: { type: [attributeSchema], default: [] },
    variants: { type: [variantSchema], default: [] },

    
    priceRange: {
      min: { type: Number },
      max: { type: Number },
    },

    publish: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);


if (process.env.NODE_ENV !== "production" && mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);