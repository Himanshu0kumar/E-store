"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  DollarSign,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Shield,
  UserX,
  Lock,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

import {
  fetchAdminUsers,
  fetchUserStats,
  deleteUserAction,
  updateUserRoleAction,
  updateUserStatusAction,
  clearUserError,
  clearUserSuccess,
} from "@/store/slices/userSlice";

import Pagination from "@/components/common/Pagination";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import Toast from "@/components/ui/Toast";

export default function UsersListPage() {
  const dispatch = useDispatch();
  const {
    users = [],
    userStats,
    pagination,
    loading,
    statsLoading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.users || {});

  // Local filter and control state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const limit = 10;

  // Initial fetch & query fetch
  const loadUsers = () => {
    dispatch(
      fetchAdminUsers({
        page: currentPage,
        limit,
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        isVerified: verifiedFilter,
        sortBy,
        sortOrder,
      })
    );
  };

  useEffect(() => {
    loadUsers();
  }, [
    dispatch,
    currentPage,
    searchQuery,
    roleFilter,
    statusFilter,
    verifiedFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    dispatch(fetchUserStats());
  }, [dispatch]);

  // Handle messages
  useEffect(() => {
    if (successMessage) {
      setToast({ message: successMessage, type: "success" });
      dispatch(clearUserSuccess());
      dispatch(fetchUserStats());
    }
    if (error) {
      setToast({ message: error, type: "error" });
      dispatch(clearUserError());
    }
  }, [successMessage, error, dispatch]);

  // Handle single delete
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete?._id) {
      await dispatch(deleteUserAction(userToDelete._id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    }
  };

  // Handle role switch
  const handleRoleChange = async (userId, newRole) => {
    await dispatch(updateUserRoleAction({ id: userId, role: newRole }));
    setToast({ message: `User role changed to ${newRole}`, type: "success" });
    loadUsers();
  };

  // Handle status toggle
  const handleStatusChange = async (userId, newStatus) => {
    await dispatch(updateUserStatusAction({ id: userId, status: newStatus }));
    setToast({
      message: `User status changed to ${newStatus}`,
      type: "success",
    });
    loadUsers();
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map((u) => u._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkStatus = async (status) => {
    if (selectedUserIds.length === 0) return;
    for (const id of selectedUserIds) {
      await dispatch(updateUserStatusAction({ id, status }));
    }
    setSelectedUserIds([]);
    setToast({
      message: `Updated ${selectedUserIds.length} users to ${status}`,
      type: "success",
    });
    loadUsers();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = [
      "Name",
      "Email",
      "Role",
      "Status",
      "Phone",
      "Verified",
      "Total Orders",
      "Total Spent",
      "Created At",
    ];
    const rows = (selectedUserIds.length > 0
      ? users.filter((u) => selectedUserIds.includes(u._id))
      : users
    ).map((u) => [
      `"${u.name || ""}"`,
      `"${u.email || ""}"`,
      u.role || "user",
      u.status || "active",
      `"${u.phone || ""}"`,
      u.isVerified ? "Yes" : "No",
      u.totalOrders || 0,
      u.totalSpent || 0,
      new Date(u.createdAt).toISOString().split("T")[0],
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerifiedFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Helpers for visuals
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Admin
          </span>
        );
      case "manager":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Manager
          </span>
        );
      case "support":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <UserCheck className="w-3 h-3 text-sky-600" />
            Support
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Customer
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Inactive
          </span>
        );
      case "banned":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Banned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            Active
          </span>
        );
    }
  };

  // Avatar initial color generator
  const getAvatarFallback = (name = "U") => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    return initials || "U";
  };

  return (
    <div className="space-y-6 pb-12">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* TOP HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
              Directory
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-semibold text-emerald-600">
              Users & Customers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-600" />
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage customer profiles, staff privileges, role access control, and
            account activities.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            href="/dashboard/users/roles"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Roles & Matrix
          </Link>

          <button
            onClick={() => {
              loadUsers();
              dispatch(fetchUserStats());
            }}
            disabled={loading}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`}
            />
          </button>

          <Link
            href="/dashboard/users/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </Link>
        </div>
      </div>

      {/* METRICS / STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/60 text-emerald-800">
              +{userStats?.newThisMonth || 0} this month
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Accounts
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {statsLoading ? "..." : userStats?.totalUsers || 0}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{userStats?.verifiedUsers || 0} Verified accounts</span>
          </div>
        </motion.div>

        {/* Active Customers Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/60 text-blue-800">
              {userStats?.totalUsers
                ? Math.round(
                    ((userStats.totalCustomers || 0) / userStats.totalUsers) *
                      100
                  )
                : 0}
              % base
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Customers
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {statsLoading ? "..." : userStats?.totalCustomers || 0}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
            <span>{userStats?.totalOrders || 0} Total completed orders</span>
          </div>
        </motion.div>

        {/* Staff & Admin Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100/60 text-purple-800">
              Staff Privileges
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Admins & Staff
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {statsLoading
                ? "..."
                : (userStats?.totalAdmins || 0) + (userStats?.totalStaff || 0)}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>
              {userStats?.totalAdmins || 0} Super Admins &middot;{" "}
              {userStats?.totalStaff || 0} Staff
            </span>
          </div>
        </motion.div>

        {/* Total Spend / LTV Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/60 text-amber-800">
              Avg ₹{(userStats?.avgSpend || 0).toFixed(0)}/user
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Customer Spend
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {statsLoading ? "..." : `₹${(userStats?.totalSpend || 0).toLocaleString()}`}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Lifetime customer gross revenue</span>
          </div>
        </motion.div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Customers (user)</option>
              <option value="admin">Admins</option>
              <option value="manager">Managers</option>
              <option value="support">Support</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>

            {/* Verification Filter */}
            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="totalSpent-desc">Highest Spend</option>
              <option value="totalOrders-desc">Most Orders</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-100/80">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg text-xs font-medium transition ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs font-medium transition ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTERS & BULK ACTIONS STRIP */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">
              Showing{" "}
              <strong className="text-slate-800">
                {pagination?.totalUsers || 0}
              </strong>{" "}
              users
            </span>
            {(searchQuery ||
              roleFilter !== "all" ||
              statusFilter !== "all" ||
              verifiedFilter !== "all") && (
              <button
                onClick={handleResetFilters}
                className="text-emerald-600 hover:text-emerald-700 font-semibold underline text-xs ml-2"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedUserIds.length > 0 && (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200">
                <span className="font-bold">{selectedUserIds.length}</span>{" "}
                selected:
                <button
                  onClick={() => handleBulkStatus("active")}
                  className="px-2 py-0.5 rounded bg-white text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatus("banned")}
                  className="px-2 py-0.5 rounded bg-white text-[11px] font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                >
                  Ban
                </button>
              </div>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* USERS LIST CONTENT */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 animate-spin mb-3">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Loading user records...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Fetching latest customer and administrator data
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
            <UserX className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No users matched your query
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search terms, changing the role or status filter,
            or reset filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedUserIds.length === users.length &&
                        users.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3.5 px-4 font-bold">User</th>
                  <th className="py-3.5 px-4 font-bold">Role</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Orders / Spend</th>
                  <th className="py-3.5 px-4 font-bold">Joined</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user._id)}
                        onChange={() => handleSelectOne(user._id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>

                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {getAvatarFallback(user.name)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/dashboard/users/${user._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-600 transition"
                            >
                              {user.name}
                            </Link>
                            {user.isVerified && (
                              <CheckCircle2
                                className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                                title="Verified Email"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="hidden sm:inline-flex items-center gap-1">
                                &middot; <Phone className="w-3 h-3 text-slate-400" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(user.status)}
                    </td>

                    {/* Orders & Spend */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 font-mono">
                        ₹{(user.totalSpent || 0).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {user.totalOrders || 0}{" "}
                        {(user.totalOrders || 0) === 1 ? "order" : "orders"}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <UserRowActionMenu
                        user={user}
                        onDelete={handleDeleteClick}
                        onRoleChange={handleRoleChange}
                        onStatusChange={handleStatusChange}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, idx) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {getAvatarFallback(user.name)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/users/${user._id}`}
                          className="font-bold text-slate-900 hover:text-emerald-600 transition"
                        >
                          {user.name}
                        </Link>
                        {user.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  <UserRowActionMenu
                    user={user}
                    onDelete={handleDeleteClick}
                    onRoleChange={handleRoleChange}
                    onStatusChange={handleStatusChange}
                  />
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Total Spent
                    </span>
                    <span className="font-bold font-mono text-slate-800">
                      ₹{(user.totalSpent || 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Orders
                    </span>
                    <span className="font-semibold text-slate-700">
                      {user.totalOrders || 0} orders
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/dashboard/users/${user._id}`}
                  className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View 360 &rarr;
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
          <p className="text-xs text-slate-500">
            Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
            <strong className="text-slate-800">{pagination.totalPages}</strong>
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete User Account?"
        description={`Are you sure you want to permanently delete "${userToDelete?.name}" (${userToDelete?.email})? This will remove their profile, carts, and wishlist.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        isLoading={actionLoading}
      />
    </div>
  );
}

// DROPDOWN ACTION MENU COMPONENT
function UserRowActionMenu({
  user,
  onDelete,
  onRoleChange,
  onStatusChange,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
      >
        <MoreVertical className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl text-xs py-1"
          >
            <Link
              href={`/dashboard/users/${user._id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              Customer 360
            </Link>

            <Link
              href={`/dashboard/users/${user._id}/edit`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              Edit Profile
            </Link>

            <div className="my-1 border-t border-slate-100" />

            {/* Quick Role Select */}
            <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase text-slate-400">
              Assign Role
            </div>
            {["user", "admin", "manager", "support"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  onRoleChange(user._id, r);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50 ${
                  user.role === r ? "font-bold text-emerald-600" : "text-slate-600"
                }`}
              >
                <span className="capitalize">{r}</span>
                {user.role === r && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </button>
            ))}

            <div className="my-1 border-t border-slate-100" />

            {/* Quick Status Select */}
            <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase text-slate-400">
              Account Status
            </div>
            {["active", "inactive", "banned"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  onStatusChange(user._id, s);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50 ${
                  user.status === s ? "font-bold text-emerald-600" : "text-slate-600"
                }`}
              >
                <span className="capitalize">{s}</span>
                {user.status === s && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </button>
            ))}

            <div className="my-1 border-t border-slate-100" />

            {/* Delete button */}
            <button
              onClick={() => {
                setOpen(false);
                onDelete(user);
              }}
              className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
