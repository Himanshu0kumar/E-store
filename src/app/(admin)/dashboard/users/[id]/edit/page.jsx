"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  ShieldCheck,
  Shield,
  UserCheck,
  Users,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  Check,
  AlertCircle,
  Camera,
  RefreshCw,
} from "lucide-react";

import {
  fetchUserDetails,
  updateUserAction,
  clearUserError,
  clearUserSuccess,
} from "@/store/slices/userSlice";

import Toast from "@/components/ui/Toast";

export default function EditUserPage() {
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

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

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
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetails(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
        status: user.status || "active",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        isVerified: user.isVerified ?? true,
      });
    }
  }, [user]);

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

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (formData.password && formData.password.length < 6) {
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
      role: formData.role,
      status: formData.status,
      phone: formData.phone,
      bio: formData.bio,
      avatar: formData.avatar || null,
      isVerified: formData.isVerified,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    const res = await dispatch(updateUserAction({ id: userId, data: payload }));
    if (!res.error) {
      setToast({ message: "User profile updated successfully!", type: "success" });
      setTimeout(() => {
        router.push(`/dashboard/users/${userId}`);
      }, 800);
    }
  };

  const rolesList = [
    { id: "user", title: "Customer", icon: Users, badge: "bg-slate-100 text-slate-700" },
    { id: "admin", title: "Administrator", icon: ShieldCheck, badge: "bg-emerald-100 text-emerald-800" },
    { id: "manager", title: "Operations Manager", icon: Shield, badge: "bg-purple-100 text-purple-800" },
    { id: "support", title: "Support Agent", icon: UserCheck, badge: "bg-sky-100 text-sky-800" },
  ];

  if (loading && !user) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 animate-spin mb-3">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Loading User...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/users/${userId}`}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Users</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-semibold text-emerald-600">
                Edit User
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Pencil className="w-5 h-5 text-emerald-600" />
              Edit {user?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/users/${userId}`}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={actionLoading}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Role & Status */}
        <div className="space-y-6">
          {/* Avatar Photo */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              Avatar Photo
            </h2>
            <div className="flex flex-col items-center gap-3 mt-3">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-bold text-sm">
                  Initials
                </div>
              )}
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData({ ...formData, avatar: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Role */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Role & Privileges
            </h2>
            <div className="space-y-2 mt-3">
              {rolesList.map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/40 font-bold text-slate-900"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs">{role.title}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status & Verification */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-800">
                Email Verified
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isVerified: !formData.isVerified })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.isVerified ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    formData.isVerified ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bio / Notes
                </label>
                <input
                  type="text"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Change Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (optional)"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
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
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
