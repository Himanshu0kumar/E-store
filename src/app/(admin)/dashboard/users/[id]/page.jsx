"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ShieldCheck,
  Shield,
  UserCheck,
  Users,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  Award,
  Clock,
  MapPin,
  KeyRound,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Bell,
  Globe,
  Lock,
  Package,
} from "lucide-react";

import {
  fetchUserDetails,
  deleteUserAction,
  updateUserRoleAction,
  updateUserStatusAction,
  updateUserAction,
  clearUserError,
  clearUserSuccess,
} from "@/store/slices/userSlice";

import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import Toast from "@/components/ui/Toast";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const userId = params?.id;

  const {
    selectedUser: user,
    loading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.users || {});

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "orders" | "addresses" | "security"
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetails(userId));
    }
  }, [dispatch, userId]);

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

  const handleDelete = async () => {
    if (userId) {
      const res = await dispatch(deleteUserAction(userId));
      if (!res.error) {
        setToast({ message: "User deleted successfully", type: "success" });
        setTimeout(() => router.push("/dashboard/users"), 800);
      }
    }
  };

  const handleRoleChange = async (role) => {
    await dispatch(updateUserRoleAction({ id: userId, role }));
    setToast({ message: `Role updated to ${role}`, type: "success" });
    dispatch(fetchUserDetails(userId));
  };

  const handleStatusChange = async (status) => {
    await dispatch(updateUserStatusAction({ id: userId, status }));
    setToast({ message: `Status updated to ${status}`, type: "success" });
    dispatch(fetchUserDetails(userId));
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setToast({
        message: "Password must be at least 6 characters",
        type: "error",
      });
      return;
    }

    const res = await dispatch(
      updateUserAction({ id: userId, data: { password: newPassword } })
    );
    if (!res.error) {
      setPasswordModalOpen(false);
      setNewPassword("");
      setToast({
        message: "User password updated successfully",
        type: "success",
      });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Super Administrator
          </span>
        );
      case "manager":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Operations Manager
          </span>
        );
      case "support":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            Support Agent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Customer Account
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Account
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Inactive Account
          </span>
        );
      case "banned":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Banned / Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const getAvatarFallback = (name = "U") => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    return initials || "U";
  };

  if (loading && !user) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 animate-spin mb-3">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Loading User Profile...
        </h3>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
        <h3 className="text-lg font-bold text-slate-800">User Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested user account does not exist or has been deleted.
        </p>
        <Link
          href="/dashboard/users"
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Users
        </Link>
      </div>
    );
  }

  const recentOrders = user.recentOrders || [];

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/users"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Users</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-semibold text-emerald-600">
                Customer 360
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {user.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/dashboard/users/${user._id}/edit`}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </Link>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-xs transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* USER HERO BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                {getAvatarFallback(user.name)}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center flex-wrap gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user.name}
                </h2>
                {user.isVerified && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800"
                    title="Verified Email"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2 pt-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
            </div>
          </div>

          {/* Quick role / status switchers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Quick Role Assign
              </label>
              <select
                value={user.role || "user"}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 focus:outline-none"
              >
                <option value="user">Customer</option>
                <option value="admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="support">Support Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Account Status
              </label>
              <select
                value={user.status || "active"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 focus:outline-none"
              >
                <option value="active">Active (Full Access)</option>
                <option value="inactive">Inactive (Suspended)</option>
                <option value="banned">Banned (Blocked)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRICS WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="p-2.5 rounded-xl bg-emerald-50">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              LTV
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-3">
            Lifetime Spend
          </p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
            ₹{(user.totalSpent || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="p-2.5 rounded-xl bg-blue-50">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Activity
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-3">
            Total Orders
          </p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
            {user.totalOrders || recentOrders.length || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-purple-600">
            <span className="p-2.5 rounded-xl bg-purple-50">
              <Award className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Gold Tier
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-3">
            Loyalty Points
          </p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
            {user.loyaltyPoints || 0} pts
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-600">
            <span className="p-2.5 rounded-xl bg-amber-50">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Last Seen
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-3">
            Last Login
          </p>
          <p className="text-sm font-bold text-slate-800 mt-1">
            {user.lastLogin
              ? new Date(user.lastLogin).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Never logged in"}
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center border-b border-slate-200 px-4 gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Contact", icon: Users },
            {
              id: "orders",
              label: `Order History (${recentOrders.length})`,
              icon: ShoppingBag,
            },
            {
              id: "addresses",
              label: `Address Book (${user.addresses?.length || 0})`,
              icon: MapPin,
            },
            { id: "security", label: "Security & Role Access", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-4 text-xs font-bold border-b-2 transition shrink-0 ${
                  isActive
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6">
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Contact & Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        Full Name
                      </span>
                      <span className="font-semibold text-slate-800">
                        {user.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        Email
                      </span>
                      <span className="font-semibold text-slate-800">
                        {user.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        Phone
                      </span>
                      <span className="font-semibold text-slate-800">
                        {user.phone || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        Account ID
                      </span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {user._id}
                      </span>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-slate-400 block text-[11px]">
                        Biography / Account Notes
                      </span>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Preferences & Communication
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">
                        Newsletter Subscription
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.preferences?.newsletter
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {user.preferences?.newsletter ? "Subscribed" : "Opted Out"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">
                        Order Status Alerts
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.preferences?.notifications
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {user.preferences?.notifications ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">
                        Preferred Currency
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {user.preferences?.currency || "INR"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ORDER HISTORY TAB */}
          {activeTab === "orders" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">
                    No orders placed yet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    When this customer makes purchases, their orders will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 font-bold">Order Number</th>
                        <th className="py-3 px-4 font-bold">Date</th>
                        <th className="py-3 px-4 font-bold">Items</th>
                        <th className="py-3 px-4 font-bold">Total</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-slate-50/80 transition"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            #{order.orderNumber || order._id.slice(-6)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {order.items?.length || 1} items
                          </td>
                          <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                            ₹{(order.pricing?.totalAmount || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {order.orderStatus || "Pending"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/dashboard/orders/${order._id}`}
                              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
                            >
                              Manage <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* 3. ADDRESS BOOK TAB */}
          {activeTab === "addresses" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!user.addresses || user.addresses.length === 0 ? (
                <div className="py-12 text-center">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">
                    No addresses registered
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Addresses saved during checkout or profile setup will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((addr, idx) => (
                    <div
                      key={addr._id || idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          {addr.type || "Address"}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {addr.street}
                      </p>
                      <p className="text-xs text-slate-500">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-xs text-slate-500">{addr.country}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* 4. SECURITY TAB */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    Password & Authentication
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set a temporary or new password on behalf of this user.
                  </p>
                  <button
                    onClick={() => setPasswordModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Reset User Password
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    Assigned Role Privileges
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Current system privilege tier:{" "}
                    <strong className="text-slate-800 capitalize">
                      {user.role}
                    </strong>
                  </p>
                  <Link
                    href="/dashboard/users/roles"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    View Role Permission Matrix &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RESET PASSWORD MODAL */}
      <AnimatePresence>
        {passwordModalOpen && (
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
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Reset Password
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter a new password for {user.name}
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Updating..." : "Set Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG */}
      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete User Account?"
        description={`Are you sure you want to permanently delete "${user.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={actionLoading}
      />
    </div>
  );
}
