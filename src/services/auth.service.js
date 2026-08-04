import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Wishlist from "@/models/Wishlist";
import RefreshToken from "@/models/RefreshToken";

// ----------------------------------------------------------------
// Token generation
// ----------------------------------------------------------------
// Every refresh token gets a unique `jti`. That id (not the userId)
// is what we use to look up the stored token later, so multiple
// concurrent sessions per user never collide.
//
// `role` is embedded in the ACCESS token only, not the refresh
// token. That's deliberate: the access token is short-lived (15m),
// so a stale role claim in it is a small, bounded window. The
// refresh token lives for 30 days — if we put role there too, a
// user demoted from admin to a regular role could keep minting
// fresh "admin" access tokens for a month using their old refresh
// token. Instead, every refresh re-reads the CURRENT role from the
// database (see refreshAccessToken below) before issuing a new
// access token.
const generateTokens = (userId, role) => {
  const jti = crypto.randomUUID();

  const accessToken = jwt.sign(
    { userId, role, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, type: "refresh", jti },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken, jti };
};

const hashRefreshToken = async (token) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(token, salt);
};

const storeRefreshToken = async (userId, jti, rawToken) => {
  const hashed = await hashRefreshToken(rawToken);
  await RefreshToken.create({
    userId,
    jti,
    token: hashed,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
};

// ----------------------------------------------------------------
// Register
// ----------------------------------------------------------------
export const registerUser = async (data) => {
  const { name, email, password, confirmPassword } = data;

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // New accounts always start as "user" — nobody signs themselves
  // up as admin through the public register endpoint. Promoting to
  // admin is a separate, deliberate action (e.g. done directly in
  // the database or through a superadmin-only endpoint), never a
  // side effect of self-registration.
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "user",
  });

  await Cart.create({ userId: user._id });
  await Wishlist.create({ userId: user._id });

  const { accessToken, refreshToken, jti } = generateTokens(user._id, user.role);
  await storeRefreshToken(user._id, jti, refreshToken);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// ----------------------------------------------------------------
// Login
// ----------------------------------------------------------------
export const loginUser = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save();

  const { accessToken, refreshToken, jti } = generateTokens(user._id, user.role);
  await storeRefreshToken(user._id, jti, refreshToken);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    },
    accessToken,
    refreshToken,
  };
};

// ----------------------------------------------------------------
// Verify token
// ----------------------------------------------------------------
export const verifyToken = async (token, tokenType = "access") => {
  const secret =
    tokenType === "access"
      ? process.env.JWT_SECRET
      : process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error(`Missing JWT secret for ${tokenType} token`);
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    throw new Error("Invalid or expired token");
  }
};

// ----------------------------------------------------------------
// Refresh access token
// ----------------------------------------------------------------
// Looked up by jti (unique per session), not userId, so refreshing
// one device's session can never grab/consume another device's
// stored token.
export const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = await verifyToken(refreshToken, "refresh");
  } catch {
    throw new Error("Unable to refresh token");
  }

  if (!decoded.jti) {
    throw new Error("Unable to refresh token");
  }

  const storedToken = await RefreshToken.findOne({ jti: decoded.jti });
  if (!storedToken) {
    throw new Error("Unable to refresh token");
  }

  const isValid = await bcrypt.compare(refreshToken, storedToken.token);
  if (!isValid) {
    // Token doesn't match what we stored for this jti — treat as
    // compromised and revoke it rather than silently failing.
    await RefreshToken.deleteOne({ _id: storedToken._id });
    throw new Error("Unable to refresh token");
  }

  // Re-read the user's CURRENT role from the database rather than
  // trusting anything from the old token. This is what makes role
  // changes (promote/demote) take effect within one refresh cycle
  // (at most 15 minutes) instead of persisting for the life of the
  // refresh token.
  const user = await User.findById(decoded.userId).select("role");
  if (!user) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    throw new Error("Unable to refresh token");
  }

  // Rotate: delete the used token, issue a brand new pair + jti.
  await RefreshToken.deleteOne({ _id: storedToken._id });

  const {
    accessToken,
    refreshToken: newRefreshToken,
    jti: newJti,
  } = generateTokens(decoded.userId, user.role);
  await storeRefreshToken(decoded.userId, newJti, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

// ----------------------------------------------------------------
// Logout
// ----------------------------------------------------------------
// Revokes only the session tied to the refresh token cookie that
// was actually presented, not every session the user has open
// elsewhere.
export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    try {
      const decoded = await verifyToken(refreshToken, "refresh");
      await RefreshToken.deleteOne({ jti: decoded.jti });
    } catch {
      // Token already invalid/expired — nothing to revoke.
    }
  }
  return { success: true, message: "Logged out successfully" };
};

// ----------------------------------------------------------------
// Profile
// ----------------------------------------------------------------
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserProfile = async (userId, data) => {
  const allowedFields = ["name", "phone", "bio", "avatar", "preferences"];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) updateData[field] = data[field];
  });

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

export const changePassword = async (userId, data) => {
  const { currentPassword, newPassword, confirmPassword } = data;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match");
  }
  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) throw new Error("Current password is incorrect");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: "Password changed successfully" };
};

// ----------------------------------------------------------------
// Addresses (unchanged)
// ----------------------------------------------------------------
export const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.addresses.length === 0) addressData.isDefault = true;

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({ _id: new mongoose.Types.ObjectId(), ...addressData });
  await user.save();
  return user.addresses;
};

export const updateAddress = async (userId, addressId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new Error("Address not found");

  Object.assign(address, addressData);

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => {
      if (addr._id.toString() !== addressId) addr.isDefault = false;
    });
  }

  await user.save();
  return user.addresses;
};

export const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new Error("Address not found");

  address.deleteOne();

  if (address.isDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return user.addresses;
};