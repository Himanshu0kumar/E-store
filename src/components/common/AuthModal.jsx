"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, Loader2, LogIn, UserPlus, ShoppingBag, ShieldCheck } from "lucide-react";
import { loginUser, registerUser, closeAuthModal, clearError } from "@/store/slices/authSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import { fetchWishlist } from "@/store/slices/wishlistSlice";
import { getPostLoginRedirect } from "@/lib/auth/redirects";

export default function AuthModal() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthModalOpen, authModalRedirect, authModalMessage, loading, error } = useSelector(
    (state) => state.auth
  );

  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    dispatch(clearError());
    dispatch(closeAuthModal());
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (activeTab === "login") {
      const result = await dispatch(loginUser({ email: formData.email, password: formData.password }));
      if (loginUser.fulfilled.match(result)) {
        dispatch(fetchCart());
        dispatch(fetchWishlist());
        dispatch(closeAuthModal());
        const targetPath = getPostLoginRedirect(result.payload?.user, authModalRedirect);
        if (authModalRedirect || result.payload?.user?.role === "admin") {
          router.push(targetPath);
        }
      }
    } else {
      const result = await dispatch(
        registerUser({ name: formData.name, email: formData.email, password: formData.password })
      );
      if (registerUser.fulfilled.match(result)) {
        dispatch(fetchCart());
        dispatch(fetchWishlist());
        dispatch(closeAuthModal());
        const targetPath = getPostLoginRedirect(result.payload?.user, authModalRedirect);
        if (authModalRedirect || result.payload?.user?.role === "admin") {
          router.push(targetPath);
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column (Flipkart-style Promo Banner) */}
          <div className="md:col-span-5 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner border border-white/20">
                <ShoppingBag className="w-6 h-6 text-emerald-300" />
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                {activeTab === "login" ? "Welcome Back" : "Join ShopX"}
              </h3>
              <p className="text-emerald-100 text-xs mt-2 leading-relaxed">
                {authModalMessage ||
                  "Log in to access your Orders, Saved Wishlist, Shopping Cart and Personalized Offers."}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>100% Safe & Secure Login</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span>Sync Cart Across Devices</span>
              </div>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-slate-900">
            <div>
              {/* Tab Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    dispatch(clearError());
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === "login"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    dispatch(clearError());
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === "register"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  New User?
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Please wait...
                    </>
                  ) : activeTab === "login" ? (
                    "Sign In to Continue"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            </div>

            <p className="text-[11px] text-center text-slate-500 mt-6">
              By continuing, you agree to ShopX&apos;s{" "}
              <a href="/terms-and-conditions" className="text-emerald-400 hover:underline">
                Terms
              </a>{" "}
              &{" "}
              <a href="/privacy-policy" className="text-emerald-400 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
