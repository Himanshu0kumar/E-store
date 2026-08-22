import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },

    
    role: {
      type: String,
      enum: ["user", "admin", "manager", "support"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },

   
    addresses: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        phone: String,
        isDefault: { type: Boolean, default: false },
        type: { type: String, enum: ["home", "work", "other"], default: "home" },
      },
    ],

    
    preferences: {
      newsletter: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
      currency: { type: String, default: "INR" },
      language: { type: String, default: "en" },
    },

    
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpiry: Date,

   
    resetToken: String,
    resetTokenExpiry: Date,

    
    lastLogin: Date,

    
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model("User", userSchema);