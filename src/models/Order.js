import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    regularPrice: { type: Number },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: { type: String, default: "" },
    selectedSize: { type: String, default: "" },
    sku: { type: String, default: "" },
  },
  { _id: true }
);

const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "United States" },
    type: { type: String, enum: ["home", "work", "other"], default: "home" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, default: "" },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        "Order must contain at least one item",
      ],
    },
    shippingAddress: {
      type: orderAddressSchema,
      required: true,
    },
    billingAddress: {
      type: orderAddressSchema,
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ["cod", "card", "upi", "netbanking", "wallet"],
        default: "card",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: { type: String, default: "" },
      cardLast4: { type: String, default: "" },
      paidAt: { type: Date },
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, default: null },
      shippingFee: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
    },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "placed",
      index: true,
    },
    trackingEvents: {
      type: [trackingEventSchema],
      default: [],
    },
    courierInfo: {
      partner: { type: String, default: "" }, // e.g., "Ekart", "Delhivery", "BlueDart", "FedEx"
      trackingNumber: { type: String, default: "" }, // AWB number
      trackingUrl: { type: String, default: "" },
      estimatedDelivery: { type: Date },
    },
    cancellation: {
      reason: { type: String, default: "" },
      cancelledBy: {
        type: String,
        enum: ["user", "admin", "system", ""],
        default: "",
      },
      cancelledAt: { type: Date },
    },
    notes: {
      type: String,
      default: "",
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Helpful indexes for efficient order queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ "customer.phone": 1 });

if (process.env.NODE_ENV !== "production" && mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
