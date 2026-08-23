"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import {
  User,
  Lock,
  Store,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sliders,
  DollarSign,
  Truck,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Admin Profile Form State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Store Settings Form State
  const [settings, setSettings] = useState({
    storeName: "ShopX Store",
    storeEmail: "support@shopx.com",
    storePhone: "+91 9876543210",
    currency: "INR",
    taxRate: 18,
    shippingFee: 50,
    freeShippingThreshold: 999,
    lowStockThreshold: 5,
    maintenanceMode: false,
    orderEmailNotifications: true,
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        api.get("/api/admin/profile"),
        api.get("/api/admin/settings"),
      ]);

      if (profileRes.data?.data) {
        const u = profileRes.data.data;
        setProfile((prev) => ({
          ...prev,
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          bio: u.bio || "",
          avatar: u.avatar || "",
        }));
      }

      if (settingsRes.data?.data) {
        const s = settingsRes.data.data;
        setSettings({
          storeName: s.storeName || "ShopX Store",
          storeEmail: s.storeEmail || "support@shopx.com",
          storePhone: s.storePhone || "+91 9876543210",
          currency: s.currency || "INR",
          taxRate: s.taxRate ?? 18,
          shippingFee: s.shippingFee ?? 50,
          freeShippingThreshold: s.freeShippingThreshold ?? 999,
          lowStockThreshold: s.lowStockThreshold ?? 5,
          maintenanceMode: Boolean(s.maintenanceMode),
          orderEmailNotifications: Boolean(s.orderEmailNotifications),
        });
      }
    } catch (err) {
      showToast(err.message || "Failed to load settings data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/api/admin/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        avatar: profile.avatar,
        currentPassword: profile.currentPassword || undefined,
        newPassword: profile.newPassword || undefined,
      });

      if (res.data?.success) {
        showToast("Profile details updated successfully!");
        setProfile((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/api/admin/settings", settings);
      if (res.data?.success) {
        showToast("Store settings saved successfully!");
      }
    } catch (err) {
      showToast(err.message || "Failed to update store settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-emerald-600" />
            Admin Account & Store Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your administrator profile credentials, security options, and store preferences.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-4 rounded-xl text-xs sm:text-sm font-semibold ${
            toast.type === "error"
              ? "bg-rose-50 border border-rose-200 text-rose-700"
              : "bg-emerald-50 border border-emerald-200 text-emerald-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <span>{toast.message}</span>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === "profile"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          <User className="w-4 h-4" />
          Admin Profile & Security
        </button>

        <button
          onClick={() => setActiveTab("store")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === "store"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          <Store className="w-4 h-4" />
          Store & Tax Configuration
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === "system"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          <Bell className="w-4 h-4" />
          System & Maintenance Controls
        </button>
      </div>

      {/* TAB 1: ADMIN PROFILE & SECURITY */}
      {activeTab === "profile" && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Administrator Profile Details</h2>
              <p className="text-xs text-slate-500">Update your name, contact information, and avatar.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Avatar Image URL</label>
              <input
                type="url"
                value={profile.avatar}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Bio / Description</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Senior Store Administrator..."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={profile.currentPassword}
                  onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={profile.newPassword}
                  onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Profile..." : "Save Profile Details"}
            </button>
          </div>
        </motion.form>
      )}

      {/* TAB 2: STORE & TAX CONFIGURATION */}
      {activeTab === "store" && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveSettings}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Store className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">E-Commerce Store & Tax Defaults</h2>
              <p className="text-xs text-slate-500">Manage store identity, taxes, shipping rules, and stock alerts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Public Store Name</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Email</label>
              <input
                type="email"
                required
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Phone</label>
              <input
                type="text"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Store Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" /> GST / Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-500" /> Standard Shipping Fee
              </label>
              <input
                type="number"
                min="0"
                value={settings.shippingFee}
                onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Free Shipping Order Threshold
              </label>
              <input
                type="number"
                min="0"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-600" /> Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Store Config..." : "Save Store Configuration"}
            </button>
          </div>
        </motion.form>
      )}

      {/* TAB 3: SYSTEM & MAINTENANCE CONTROLS */}
      {activeTab === "system" && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveSettings}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Bell className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">System Mode & Notification Controls</h2>
              <p className="text-xs text-slate-500">Configure global maintenance status and operational alerts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Store Maintenance Mode</h3>
                <p className="text-xs text-slate-500">
                  When enabled, storefront visitors will see a scheduled maintenance notice.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Order Email Notifications</h3>
                <p className="text-xs text-slate-500">
                  Automatically send automated confirmation emails to users upon successful order placement.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.orderEmailNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, orderEmailNotifications: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving System Controls..." : "Save System Controls"}
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
