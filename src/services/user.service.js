import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "@/models/User";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Wishlist from "@/models/Wishlist";
import RefreshToken from "@/models/RefreshToken";

/**
 * Fetch paginated, filtered, and sorted list of users for admin dashboard
 */
export const getAllUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role = "all",
  status = "all",
  isVerified = "all",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  // Search by name, email, or phone
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  // Filter by role
  if (role && role !== "all") {
    query.role = role;
  }

  // Filter by status
  if (status && status !== "all") {
    query.status = status;
  }

  // Filter by verification status
  if (isVerified && isVerified !== "all") {
    query.isVerified = isVerified === "true" || isVerified === true;
  }

  // Sort mapping
  const sort = {};
  const validSortFields = [
    "createdAt",
    "name",
    "email",
    "role",
    "status",
    "totalSpent",
    "totalOrders",
    "lastLogin",
  ];
  const order = sortOrder === "asc" ? 1 : -1;

  if (validSortFields.includes(sortBy)) {
    sort[sortBy] = order;
  } else {
    sort.createdAt = -1;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password -resetToken -verificationToken")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    users,
    pagination: {
      totalUsers: total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

/**
 * Fetch aggregate statistics for admin dashboard metrics
 */
export const getUserStats = async () => {
  const [
    totalUsers,
    totalAdmins,
    totalStaff,
    totalCustomers,
    activeUsers,
    bannedUsers,
    verifiedUsers,
    spendAggregate,
    newThisMonth,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: { $in: ["manager", "support"] } }),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "banned" }),
    User.countDocuments({ isVerified: true }),
    User.aggregate([
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalSpent" },
          totalOrders: { $sum: "$totalOrders" },
          avgSpent: { $avg: "$totalSpent" },
        },
      },
    ]),
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
  ]);

  const totalSpend = spendAggregate[0]?.totalSpent || 0;
  const totalOrders = spendAggregate[0]?.totalOrders || 0;
  const avgSpend = spendAggregate[0]?.avgSpent || 0;
  const verifiedPercentage =
    totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

  return {
    totalUsers,
    totalAdmins,
    totalStaff,
    totalCustomers,
    activeUsers,
    bannedUsers,
    verifiedUsers,
    verifiedPercentage,
    totalSpend,
    totalOrders,
    avgSpend,
    newThisMonth,
  };
};

/**
 * Get detailed user profile with recent orders
 */
export const getUserById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid User ID format");
  }

  const user = await User.findById(id)
    .select("-password -resetToken -verificationToken")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch recent customer orders
  const recentOrders = await Order.find({
    $or: [{ user: id }, { "customer.email": user.email }],
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    ...user,
    recentOrders: recentOrders || [],
  };
};

/**
 * Create a new user with secure password hash
 */
export const createUser = async (userData) => {
  const {
    name,
    email,
    password,
    role = "user",
    status = "active",
    phone = "",
    bio = "",
    avatar = null,
    isVerified = false,
    addresses = [],
    preferences = {},
  } = userData;

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check email conflict
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    status,
    phone: phone ? phone.trim() : null,
    bio: bio ? bio.trim() : null,
    avatar: avatar || null,
    isVerified: Boolean(isVerified),
    addresses: Array.isArray(addresses) ? addresses : [],
    preferences: {
      newsletter: preferences.newsletter ?? true,
      notifications: preferences.notifications ?? true,
      currency: preferences.currency || "INR",
      language: preferences.language || "en",
    },
  });

  // Initialize companion documents for the new user
  try {
    await Promise.all([
      Cart.create({ user: newUser._id, items: [] }),
      Wishlist.create({ user: newUser._id, products: [] }),
    ]);
  } catch (err) {
    console.error("Companion collection creation error:", err);
  }

  const createdUser = await User.findById(newUser._id)
    .select("-password -resetToken -verificationToken")
    .lean();

  return createdUser;
};

/**
 * Update user details
 */
export const updateUser = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid User ID format");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Handle email update conflict
  if (updateData.email && updateData.email.toLowerCase() !== user.email) {
    const existing = await User.findOne({
      email: updateData.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error("This email is already in use by another account");
    }
    user.email = updateData.email.toLowerCase().trim();
  }

  // Fields to update
  if (updateData.name !== undefined) user.name = updateData.name.trim();
  if (updateData.phone !== undefined) user.phone = updateData.phone;
  if (updateData.bio !== undefined) user.bio = updateData.bio;
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar;
  if (updateData.role !== undefined) user.role = updateData.role;
  if (updateData.status !== undefined) user.status = updateData.status;
  if (updateData.isVerified !== undefined)
    user.isVerified = Boolean(updateData.isVerified);
  if (Array.isArray(updateData.addresses)) user.addresses = updateData.addresses;
  if (updateData.preferences) {
    user.preferences = {
      ...user.preferences?.toObject?.(),
      ...updateData.preferences,
    };
  }

  // Optional password reset
  if (updateData.password && updateData.password.trim().length >= 6) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(updateData.password.trim(), salt);
  }

  await user.save();

  return await User.findById(id)
    .select("-password -resetToken -verificationToken")
    .lean();
};

/**
 * Delete a user and cascade clean associated data
 */
export const deleteUser = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid User ID format");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Cascade delete
  await Promise.all([
    User.findByIdAndDelete(id),
    Cart.deleteOne({ user: id }),
    Wishlist.deleteOne({ user: id }),
    RefreshToken.deleteMany({ userId: id }),
  ]);

  return { success: true, message: "User deleted successfully", id };
};

/**
 * Update user role
 */
export const updateUserRole = async (id, role) => {
  const allowedRoles = ["user", "admin", "manager", "support"];
  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role specified");
  }

  return await updateUser(id, { role });
};

/**
 * Update user status
 */
export const updateUserStatus = async (id, status) => {
  const allowedStatuses = ["active", "inactive", "banned"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status specified");
  }

  return await updateUser(id, { status });
};
