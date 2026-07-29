import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Unique id embedded in the JWT payload. Lets one user have
  // multiple valid sessions (web, mobile, etc.) without refresh
  // lookups colliding across devices.
  jti: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  token: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // TTL index: Mongo deletes the document automatically once
  // expiresAt passes, so dead tokens don't accumulate forever.
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

export default mongoose.models.RefreshToken ||
  mongoose.model("RefreshToken", refreshTokenSchema);