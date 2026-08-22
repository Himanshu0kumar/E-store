import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productSKU: {
      type: String,
      default: "",
    },
    variantId: {
      type: String,
      default: null,
    },
    variantSku: {
      type: String,
      default: "",
    },
    changeType: {
      type: String,
      enum: [
        "restock",
        "order_deducted",
        "order_cancelled_restock",
        "manual_adjustment",
        "damaged",
        "return_restock",
      ],
      required: true,
      index: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    referenceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    referenceOrderNumber: {
      type: String,
      default: "",
    },
    performedBy: {
      type: String,
      default: "System",
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.InventoryLog) {
  delete mongoose.models.InventoryLog;
}

export default mongoose.models.InventoryLog ||
  mongoose.model("InventoryLog", inventoryLogSchema);
