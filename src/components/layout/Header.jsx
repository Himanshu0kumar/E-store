"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
// import { logoutUser } from "@/store/slices/authSlice";

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     router.replace("/login");
//   };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-wide text-white hover:text-green-400 transition"
        >
          Shop<span className="text-green-400">X</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
          <Link href="/products" className="hover:text-white transition">
            Products
          </Link>
          <Link href="/about" className="hover:text-white transition">
            About
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-3">

          {!user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-white hover:text-green-400 transition"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-green-500 text-black rounded-lg hover:bg-green-400 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm text-white hover:text-green-400 transition"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-400 transition"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}