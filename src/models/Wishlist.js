import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
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
        addedAt: {
          type: Date,
          default: Date.now,
        },
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },
        note: String,
      },
    ],

    
    name: {
      type: String,
      default: "My Wishlist",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Update totalItems before saving
wishlistSchema.pre("save", function () {
  this.totalItems = this.items.length;
  
});

export default mongoose.models.Wishlist ||
  mongoose.model("Wishlist", wishlistSchema);