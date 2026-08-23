import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "ShopX Store",
      trim: true,
    },
    storeEmail: {
      type: String,
      default: "support@shopx.com",
      trim: true,
      lowercase: true,
    },
    storePhone: {
      type: String,
      default: "+91 9876543210",
      trim: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    taxRate: {
      type: Number,
      default: 18,
      min: 0,
      max: 100,
    },
    shippingFee: {
      type: Number,
      default: 50,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 999,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 1,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    orderEmailNotifications: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

export default mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
