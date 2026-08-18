"use client";

import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Mail, Lock, Eye, EyeOff, Loader, LogIn } from "lucide-react";
import { loginUser } from "@/store/slices/authSlice";
import { getPostLoginRedirect } from "@/lib/auth/redirects";

function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || searchParams.get("from");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser({ ...data, rememberMe }));

    if (loginUser.fulfilled.match(result)) {
      const targetPath = getPostLoginRedirect(result.payload?.user, redirectPath);
      router.push(targetPath);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 text-white">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
              <LogIn className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-white"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-200">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-white"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900/50 border border-slate-700 accent-emerald-500 cursor-pointer"
              />
              <label className="text-sm text-slate-400 cursor-pointer">
                Keep me logged in for 30 days
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                <p className="font-semibold mb-1">Login Failed</p>
                <p>{error}</p>
                {error === "Invalid email or password" && (
                  <p className="text-yellow-400 mt-2 text-xs">
                    Please check your email and password and try again.
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 hover:bg-slate-800/50 transition text-sm text-slate-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm3.5 10c0 1.93-1.57 3.5-3.5 3.5S6.5 11.93 6.5 10 8.07 6.5 10 6.5s3.5 1.57 3.5 3.5z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 hover:bg-slate-800/50 transition text-sm text-slate-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M20 10c0-5.52-4.48-10-10-10S0 4.48 0 10c0 4.84 3.44 8.87 8 9.8V12.9h-2.7V10h2.7V7.79c0-2.67 1.58-4.15 4.02-4.15 1.16 0 2.37.21 2.37.21v2.6h-1.33c-1.31 0-1.72.82-1.72 1.66V10h2.93l-.47 2.9h-2.46v6.9C16.56 18.87 20 14.84 20 10z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/register")}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Create one now
              </button>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p> Secure login with SSL encryption</p>
          <p> No spam, we promise</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}