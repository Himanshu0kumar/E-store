"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Check,
  AlertCircle,
  Camera,
  Globe,
  Bell,
} from "lucide-react";

import { createUserAction } from "@/store/slices/userSlice";
import Toast from "@/components/ui/Toast";

export default function CreateUserPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { actionLoading, error } = useSelector((state) => state.users || {});

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
    phone: "",
    bio: "",
    avatar: "",
    isVerified: true,
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    newsletter: true,
    notifications: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Generate strong random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setToast({
        message: "Please fill all required fields correctly",
        type: "error",
      });
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      status: formData.status,
      phone: formData.phone,
      bio: formData.bio,
      avatar: formData.avatar || null,
      isVerified: formData.isVerified,
      addresses: formData.street
        ? [
            {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
              isDefault: true,
            },
          ]
        : [],
      preferences: {
        newsletter: formData.newsletter,
        notifications: formData.notifications,
      },
    };

    const res = await dispatch(createUserAction(payload));
    if (res.error) {
      setToast({
        message: res.payload || "Failed to create user",
        type: "error",
      });
    } else {
      setToast({ message: "User created successfully!", type: "success" });
      setTimeout(() => {
        router.push("/dashboard/users");
      }, 1000);
    }
  };

  const rolesList = [
    {
      id: "user",
      title: "Customer",
      icon: Users,
      desc: "Standard e-commerce customer account. Can place orders, manage carts and wishlist.",
      badge: "bg-slate-100 text-slate-700",
    },
    {
      id: "admin",
      title: "Administrator",
      icon: ShieldCheck,
      desc: "Full root access to store settings, products, orders, users, and financial reports.",
      badge: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "manager",
      title: "Operations Manager",
      icon: Shield,
      desc: "Manages catalog, inventory, categories, brands, and order processing workflows.",
      badge: "bg-purple-100 text-purple-800",
    },
    {
      id: "support",
      title: "Support Agent",
      icon: UserCheck,
      desc: "Handles customer inquiries, reviews order statuses, and checks delivery logistics.",
      badge: "bg-sky-100 text-sky-800",
    },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* HEADER */}
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
                New User
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-emerald-600" />
              Create New Account
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/users"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={actionLoading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Account
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Role & Status & Avatar */}
        <div className="space-y-6">
          {/* Avatar / Profile photo card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              Profile Photo
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter an image URL or leave blank for auto-generated initials.
            </p>

            <div className="flex flex-col items-center gap-4 text-center">
              {formData.avatar ? (
                <div className="relative">
                  <img
                    src={formData.avatar}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: "" })}
                    className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:bg-rose-600 transition text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <Camera className="w-6 h-6 mb-1 text-slate-400" />
                  <span className="text-[10px] font-semibold">No Image</span>
                </div>
              )}

              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData({ ...formData, avatar: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Account Role Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Account Role
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select permission privileges for this user.
            </p>

            <div className="space-y-2.5">
              {rolesList.map((role) => {
                const IconComponent = role.icon;
                const isSelected = formData.role === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {role.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.badge}`}
                        >
                          {role.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status & Verification Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Account Status & Security
            </h2>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="active">Active (Full access)</option>
                <option value="inactive">Inactive (Suspended)</option>
                <option value="banned">Banned (Blocked login)</option>
              </select>
            </div>

            {/* Verified Switch */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Email Verified
                </span>
                <span className="text-[11px] text-slate-400">
                  Pre-verify email address
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isVerified: !formData.isVerified })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.isVerified ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    formData.isVerified ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT 2 COLUMNS: Personal Details, Address, Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Personal Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formErrors.name ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                  } bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="alex.morgan@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border ${
                      formErrors.email
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-200"
                    } bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    Auto-Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl border ${
                      formErrors.password
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-200"
                    } bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.password}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bio / Notes
                </label>
                <input
                  type="text"
                  placeholder="VIP client, frequent buyer, internal staff notes..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Primary Address (Optional) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Primary Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="123 Market Street, Suite 400"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State / Province
                </label>
                <input
                  type="text"
                  placeholder="CA"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="94103"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              Notifications & Marketing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) =>
                    setFormData({ ...formData, newsletter: e.target.checked })
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Newsletter Subscription
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Receive weekly discounts & product drops
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Order Status SMS/Email
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Receive shipment tracking notifications
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
