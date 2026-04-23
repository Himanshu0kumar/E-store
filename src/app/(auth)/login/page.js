"use client";

import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, user, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    await dispatch(loginUser(data));
  };

  useEffect(() => {
    if (user?.token) {
      router.replace("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 text-white">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-400">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-2">
            Login to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-black/30 border border-white/10 focus:border-green-400 outline-none"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-black/30 border border-white/10 focus:border-green-400 outline-none"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Error with guidance */}
          {error && (
            <div className="text-center text-sm text-red-300 bg-red-500/10 p-2 rounded-lg">
              {error}
              {error === "User not found" && (
                <p className="text-yellow-400 mt-1">
                  No account found. You can register below.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Navigation choice */}
        <div className="text-center mt-6 text-sm text-gray-400">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-green-400 hover:underline cursor-pointer"
          >
            Register
          </span>
        </div>

      </div>
    </div>
  );
}