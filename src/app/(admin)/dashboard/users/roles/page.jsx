"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Shield,
  UserCheck,
  Users,
  Lock,
  Check,
  X,
  Sparkles,
  KeyRound,
  UserPlus,
  Crown,
  Eye,
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingBag,
  Tag,
  FileText,
  DollarSign,
  Settings,
  Info,
  RefreshCw,
} from "lucide-react";

import {
  fetchAdminUsers,
  fetchUserStats,
  fetchRolePermissions,
  updateRolePermissionsAction,
  resetRolePermissionsAction,
  updateUserRoleAction,
  clearUserError,
  clearUserSuccess,
} from "@/store/slices/userSlice";

import Toast from "@/components/ui/Toast";

export default function RolesPermissionsPage() {
  const dispatch = useDispatch();
  const {
    users = [],
    userStats,
    rolePermissions = [],
    permissionsLoading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.users || {});

  const [activeRoleKey, setActiveRoleKey] = useState("manager"); // "admin" | "manager" | "support" | "user"
  const [editedPermissions, setEditedPermissions] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Initial load
  useEffect(() => {
    dispatch(fetchRolePermissions());
    dispatch(fetchAdminUsers({ limit: 50 }));
    dispatch(fetchUserStats());
  }, [dispatch]);

  // Handle messages
  useEffect(() => {
    if (successMessage) {
      setToast({ message: successMessage, type: "success" });
      dispatch(clearUserSuccess());
    }
    if (error) {
      setToast({ message: error, type: "error" });
      dispatch(clearUserError());
    }
  }, [successMessage, error, dispatch]);

  // Find active role document from server state
  const activeRoleDoc = useMemo(() => {
    return rolePermissions.find((rp) => rp.role === activeRoleKey) || null;
  }, [rolePermissions, activeRoleKey]);

  // Sync edited permissions when switching tab or when server data loads
  useEffect(() => {
    if (activeRoleDoc?.permissions) {
      setEditedPermissions(JSON.parse(JSON.stringify(activeRoleDoc.permissions)));
      setHasUnsavedChanges(false);
    }
  }, [activeRoleDoc, activeRoleKey]);

  // Handle toggle of a single permission
  const handleToggle = (moduleKey, permKey) => {
    if (activeRoleKey === "admin" && (permKey === "manageRoles" || moduleKey === "settings")) {
      setToast({
        message: "Root administrative and role security permissions are locked for Super Admin.",
        type: "info",
      });
      return;
    }

    setEditedPermissions((prev) => {
      const modulePerms = prev[moduleKey] || {};
      const updated = {
        ...prev,
        [moduleKey]: {
          ...modulePerms,
          [permKey]: !modulePerms[permKey],
        },
      };
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  // Toggle all in a module
  const handleToggleModuleAll = (moduleKey, enable) => {
    setEditedPermissions((prev) => {
      const modulePerms = prev[moduleKey] || {};
      const updatedModule = {};
      Object.keys(modulePerms).forEach((k) => {
        if (activeRoleKey === "admin" && (k === "manageRoles" || moduleKey === "settings")) {
          updatedModule[k] = true;
        } else {
          updatedModule[k] = enable;
        }
      });
      setHasUnsavedChanges(true);
      return {
        ...prev,
        [moduleKey]: updatedModule,
      };
    });
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!activeRoleKey || !editedPermissions) return;

    const res = await dispatch(
      updateRolePermissionsAction({
        role: activeRoleKey,
        permissions: editedPermissions,
      })
    );

    if (!res.error) {
      setHasUnsavedChanges(false);
      dispatch(fetchRolePermissions());
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (activeRoleDoc?.permissions) {
      setEditedPermissions(JSON.parse(JSON.stringify(activeRoleDoc.permissions)));
      setHasUnsavedChanges(false);
      setToast({ message: "Changes discarded", type: "info" });
    }
  };

  // Reset to factory defaults
  const handleConfirmReset = async () => {
    const res = await dispatch(resetRolePermissionsAction(activeRoleKey));
    setResetModalOpen(false);
    if (!res.error) {
      setHasUnsavedChanges(false);
      dispatch(fetchRolePermissions());
    }
  };

  // Quick role change for staff member
  const handleStaffRoleChange = async (userId, newRole) => {
    await dispatch(updateUserRoleAction({ id: userId, role: newRole }));
    setToast({
      message: `Staff member role updated to ${newRole}`,
      type: "success",
    });
    dispatch(fetchAdminUsers({ limit: 50 }));
  };

  // Staff members in active role
  const staffInActiveRole = users.filter((u) => u.role === activeRoleKey);

  // Role metadata configurations
  const roleCards = [
    {
      key: "admin",
      title: "Super Administrator",
      icon: Crown,
      color: "from-emerald-600 to-teal-700",
      activeBg: "bg-emerald-50 border-emerald-500 text-emerald-950",
      badge: "Root Master",
      desc: "Full system authority. Manages security, permissions, and database operations.",
    },
    {
      key: "manager",
      title: "Operations Manager",
      icon: Shield,
      color: "from-purple-600 to-indigo-700",
      activeBg: "bg-purple-50 border-purple-500 text-purple-950",
      badge: "Customizable",
      desc: "Manages catalog, products, orders, categories, and day-to-day operations.",
    },
    {
      key: "support",
      title: "Customer Support",
      icon: UserCheck,
      color: "from-sky-600 to-blue-700",
      activeBg: "bg-sky-50 border-sky-500 text-sky-950",
      badge: "Customizable",
      desc: "Handles customer inquiries, reviews orders, and manages shipments.",
    },
    {
      key: "user",
      title: "Registered Customer",
      icon: Users,
      color: "from-slate-700 to-slate-900",
      activeBg: "bg-slate-100 border-slate-500 text-slate-950",
      badge: "Storefront",
      desc: "Standard customer privileges for cart, wishlist, placing orders, and profile.",
    },
  ];

  // Modules definition
  const moduleConfigs = [
    {
      key: "products",
      title: "Products & Catalog",
      icon: Package,
      desc: "Manage store items, variants, stock inventory, and pricing.",
      capabilities: [
        { key: "view", label: "View Products", desc: "Access product catalog & details" },
        { key: "create", label: "Add Products", desc: "Create new items & variants" },
        { key: "edit", label: "Edit Products", desc: "Update pricing, stock, & descriptions" },
        { key: "delete", label: "Delete Products", desc: "Permanently remove products" },
      ],
    },
    {
      key: "orders",
      title: "Orders & Fulfillment",
      icon: ShoppingBag,
      desc: "Process customer orders, packaging, status updates, and tracking.",
      capabilities: [
        { key: "view", label: "View Orders", desc: "Browse customer order records" },
        { key: "create", label: "Create Orders", desc: "Place orders on behalf of clients" },
        { key: "edit", label: "Update Orders", desc: "Change status (Pending, Shipped, Done)" },
        { key: "delete", label: "Cancel / Delete", desc: "Cancel or remove order entries" },
      ],
    },
    {
      key: "users",
      title: "Users & Access Control",
      icon: Users,
      desc: "Customer accounts, staff management, and security roles.",
      capabilities: [
        { key: "view", label: "View Users", desc: "Browse customer & staff profiles" },
        { key: "create", label: "Create Users", desc: "Add new accounts or staff" },
        { key: "edit", label: "Edit Profiles", desc: "Update user data & addresses" },
        { key: "delete", label: "Delete Users", desc: "Delete accounts & customer records" },
        { key: "manageRoles", label: "Manage Roles", desc: "Promote/demote & edit permissions" },
      ],
    },
    {
      key: "categories",
      title: "Categories Management",
      icon: Tag,
      desc: "Product taxonomies, subcategories, and menu hierarchy.",
      capabilities: [
        { key: "view", label: "View Categories", desc: "Browse category hierarchy" },
        { key: "create", label: "Create Categories", desc: "Add new category groupings" },
        { key: "edit", label: "Edit Categories", desc: "Update category titles & slugs" },
        { key: "delete", label: "Delete Categories", desc: "Remove category items" },
      ],
    },
    {
      key: "brands",
      title: "Brands Directory",
      icon: Tag,
      desc: "Manufacturer brands, vendor listings, and logos.",
      capabilities: [
        { key: "view", label: "View Brands", desc: "List brand records" },
        { key: "create", label: "Add Brands", desc: "Create new brand partners" },
        { key: "edit", label: "Edit Brands", desc: "Update brand details & logos" },
        { key: "delete", label: "Delete Brands", desc: "Remove brands from catalog" },
      ],
    },
    {
      key: "blog",
      title: "Blog & Content Hub",
      icon: FileText,
      desc: "Articles, editorial announcements, and blog categories.",
      capabilities: [
        { key: "view", label: "View Articles", desc: "Browse published and draft blogs" },
        { key: "create", label: "Create Articles", desc: "Write new blog posts" },
        { key: "edit", label: "Edit Articles", desc: "Update content & SEO meta" },
        { key: "delete", label: "Delete Articles", desc: "Remove blog posts" },
      ],
    },
    {
      key: "analytics",
      title: "Analytics & Financials",
      icon: DollarSign,
      desc: "Gross revenue reports, sales metrics, and customer trends.",
      capabilities: [
        { key: "viewRevenue", label: "View Revenue", desc: "See financial totals & sales sums" },
        { key: "viewReports", label: "View Reports", desc: "Analyze order & traffic charts" },
        { key: "exportData", label: "Export Reports", desc: "Download CSV & financial reports" },
      ],
    },
    {
      key: "settings",
      title: "System & Security Settings",
      icon: Settings,
      desc: "Store configuration, payment gateways, and security keys.",
      capabilities: [
        { key: "view", label: "View Settings", desc: "Inspect system configurations" },
        { key: "edit", label: "Edit Settings", desc: "Modify store & security settings" },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/users"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">User Management</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-semibold text-emerald-600">
                Custom RBAC Matrix
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              Role Access & Permissions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin can customize and edit granular module access and capabilities for any role.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Defaults
          </button>

          <Link
            href="/dashboard/users/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            <UserPlus className="w-4 h-4" />
            Invite Staff
          </Link>
        </div>
      </div>

      {/* ROLE SELECTOR CARDS / TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {roleCards.map((rc) => {
          const Icon = rc.icon;
          const isSelected = activeRoleKey === rc.key;
          const count =
            users.filter((u) => u.role === rc.key).length || 0;

          return (
            <motion.div
              key={rc.key}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (
                    !window.confirm(
                      "You have unsaved changes in this role. Switch anyway?"
                    )
                  ) {
                    return;
                  }
                }
                setActiveRoleKey(rc.key);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs relative flex flex-col justify-between ${
                isSelected
                  ? rc.activeBg + " ring-2 ring-emerald-500/30 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-tr ${rc.color} text-white shadow-xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white text-slate-800 shadow-xs"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {rc.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">
                  {rc.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                  {rc.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  {count} {count === 1 ? "member" : "members"}
                </span>
                {isSelected ? (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Editing
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">
                    Click to edit
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SUPER ADMIN NOTICE IF ACTIVE */}
      {activeRoleKey === "admin" && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
          <Crown className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              Super Administrator (Root Level)
            </span>
            <p className="text-emerald-700 text-[11px] mt-0.5">
              Super Administrators possess complete system override authority. Role management and system settings are protected to ensure permanent administrative recovery.
            </p>
          </div>
        </div>
      )}

      {/* PERMISSIONS GRID EDITOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Module Access Permissions &middot;{" "}
              <span className="text-emerald-600 capitalize">
                {activeRoleKey}
              </span>
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Toggle switches to grant or revoke specific actions
          </span>
        </div>

        {permissionsLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              Loading permissions matrix...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moduleConfigs.map((mod) => {
              const Icon = mod.icon;
              const modulePerms = editedPermissions[mod.key] || {};
              const allEnabled = mod.capabilities.every(
                (c) => modulePerms[c.key] === true
              );

              return (
                <motion.div
                  key={mod.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Module header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                          <Icon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">
                            {mod.title}
                          </h3>
                          <p className="text-[10px] text-slate-400">{mod.desc}</p>
                        </div>
                      </div>

                      {/* Quick Bulk Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleModuleAll(mod.key, !allEnabled)
                        }
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                      >
                        {allEnabled ? "Revoke All" : "Grant All"}
                      </button>
                    </div>

                    {/* Capabilities list */}
                    <div className="space-y-2.5 pt-3">
                      {mod.capabilities.map((cap) => {
                        const isGranted = Boolean(modulePerms[cap.key]);

                        return (
                          <div
                            key={cap.key}
                            onClick={() => handleToggle(mod.key, cap.key)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                              isGranted
                                ? "border-emerald-200 bg-emerald-50/40 text-slate-900"
                                : "border-slate-100 bg-slate-50/40 text-slate-500 hover:border-slate-200"
                            }`}
                          >
                            <div>
                              <span
                                className={`text-xs block font-bold ${
                                  isGranted ? "text-emerald-950" : "text-slate-700"
                                }`}
                              >
                                {cap.label}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {cap.desc}
                              </span>
                            </div>

                            {/* Switch Pill */}
                            <div
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                isGranted ? "bg-emerald-600" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                  isGranted ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* STAFF MEMBERS WITH THIS ROLE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Members Assigned to &ldquo;{activeRoleKey}&rdquo;
            </h3>
            <p className="text-xs text-slate-500">
              Users currently operating with this permission matrix.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600">
            {staffInActiveRole.length} Accounts
          </span>
        </div>

        {staffInActiveRole.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No accounts currently assigned to the {activeRoleKey} role.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {staffInActiveRole.map((member) => (
              <div
                key={member._id}
                className="py-3 flex items-center justify-between flex-wrap gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {member.name?.[0] || "U"}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {member.name}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {member.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleStaffRoleChange(member._id, e.target.value)
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none"
                  >
                    <option value="admin">Super Admin</option>
                    <option value="manager">Manager</option>
                    <option value="support">Support</option>
                    <option value="user">Customer</option>
                  </select>

                  <Link
                    href={`/dashboard/users/${member._id}`}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR FOR UNSAVED CHANGES */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-700/80 flex items-center justify-between gap-4 max-w-xl"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold block">
                  Unsaved Permission Changes
                </span>
                <span className="text-[11px] text-slate-400">
                  Role: <strong className="text-white capitalize">{activeRoleKey}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscardChanges}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Matrix
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {resetModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Reset Role Permissions?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Revert &ldquo;{activeRoleKey}&rdquo; to factory default access matrix.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  {actionLoading ? "Resetting..." : "Confirm Reset"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
