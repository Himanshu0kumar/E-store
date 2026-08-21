import mongoose from "mongoose";

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    role: "admin",
    displayName: "Super Administrator",
    description: "Unrestricted root access to all store modules, user permissions, and settings.",
    isSystem: true,
    permissions: {
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true, manageRoles: true },
      categories: { view: true, create: true, edit: true, delete: true },
      brands: { view: true, create: true, edit: true, delete: true },
      blog: { view: true, create: true, edit: true, delete: true },
      analytics: { viewRevenue: true, viewReports: true, exportData: true },
      settings: { view: true, edit: true },
    },
  },
  manager: {
    role: "manager",
    displayName: "Operations Manager",
    description: "Full control over products, orders, categories, brands, and content with restricted access to finance & system settings.",
    isSystem: false,
    permissions: {
      products: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, create: true, edit: true, delete: false },
      users: { view: true, create: false, edit: false, delete: false, manageRoles: false },
      categories: { view: true, create: true, edit: true, delete: true },
      brands: { view: true, create: true, edit: true, delete: true },
      blog: { view: true, create: true, edit: true, delete: true },
      analytics: { viewRevenue: false, viewReports: true, exportData: true },
      settings: { view: false, edit: false },
    },
  },
  support: {
    role: "support",
    displayName: "Customer Support",
    description: "Read-only and update access for customer orders and user profiles to handle inquiries.",
    isSystem: false,
    permissions: {
      products: { view: true, create: false, edit: false, delete: false },
      orders: { view: true, create: false, edit: true, delete: false },
      users: { view: true, create: false, edit: false, delete: false, manageRoles: false },
      categories: { view: true, create: false, edit: false, delete: false },
      brands: { view: true, create: false, edit: false, delete: false },
      blog: { view: true, create: false, edit: false, delete: false },
      analytics: { viewRevenue: false, viewReports: false, exportData: false },
      settings: { view: false, edit: false },
    },
  },
  user: {
    role: "user",
    displayName: "Registered Customer",
    description: "Standard storefront access for browsing, carts, wishlists, placing orders, and self profile.",
    isSystem: false,
    permissions: {
      products: { view: true, create: false, edit: false, delete: false },
      orders: { view: true, create: true, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false, manageRoles: false },
      categories: { view: true, create: false, edit: false, delete: false },
      brands: { view: true, create: false, edit: false, delete: false },
      blog: { view: true, create: false, edit: false, delete: false },
      analytics: { viewRevenue: false, viewReports: false, exportData: false },
      settings: { view: false, edit: false },
    },
  },
};

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      enum: ["admin", "manager", "support", "user"],
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    permissions: {
      products: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      orders: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      users: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        manageRoles: { type: Boolean, default: false },
      },
      categories: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      brands: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      blog: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      analytics: {
        viewRevenue: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        exportData: { type: Boolean, default: false },
      },
      settings: {
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.RolePermission ||
  mongoose.model("RolePermission", rolePermissionSchema);
