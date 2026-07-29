import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        selectedColor: String,
        selectedSize: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Cart Summary
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: { type: Number, default: 0 },

    
    status: {
      type: String,
      enum: ["active", "abandoned", "converted"],
      default: "active",
    },

    // Expiry (auto-cleanup after 30 days)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);


cartSchema.pre("save", function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.tax = Math.round(this.subtotal * 0.1 * 100) / 100; 
  this.total = this.subtotal + this.tax + this.shipping - this.discount;
  
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);