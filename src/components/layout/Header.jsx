"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { logoutUser } from "@/store/slices/authSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import { fetchWishlist } from "@/store/slices/wishlistSlice";

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useSelector((state) => state.auth);
  const cartState = useSelector((state) => state.cart);
  const wishlistState = useSelector((state) => state.wishlist);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Fetch cart & wishlist on mount or user change
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch, user]);

  const cartCount = cartState?.items?.length || cartState?.itemCount || 0;
  const wishlistCount = wishlistState?.items?.length || wishlistState?.totalItems || 0;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/login");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl text-slate-100 shadow-xl shadow-black/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* LOGO */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 group text-xl font-bold tracking-wider text-white hover:opacity-90 transition"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition transform">
                X
              </div>
              <span className="text-white">
                Shop<span className="text-emerald-400 font-extrabold">X</span>
              </span>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg transition ${
                  isActive("/")
                    ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                Home
              </Link>
              <Link
                href="/product"
                className={`px-3 py-2 rounded-lg transition ${
                  isActive("/product")
                    ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                Products
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 rounded-lg transition ${
                  isActive("/about")
                    ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                About
              </Link>
            </nav>
          </div>

          {/* DESKTOP SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories..."
                className="w-full rounded-full border border-slate-800 bg-slate-900/90 pl-10 pr-10 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* ACTION ICONS & AUTH */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* MOBILE SEARCH TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* WISHLIST BUTTON */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-slate-900 transition group"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 transition group-hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/40 animate-pulse">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* CART BUTTON */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition group"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5 transition group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md shadow-emerald-500/40">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* DIVIDER */}
            <div className="hidden sm:block h-5 w-px bg-slate-800 my-auto mx-1" />

            {/* AUTH / PROFILE */}
            {!user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-semibold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-900 transition"
                  title="Dashboard"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                    {user.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name || "Dashboard"}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH BAR SLIDE DOWN */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-4 pt-1 transition-all">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full rounded-full border border-slate-800 bg-slate-900 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl transition ${
                isActive("/")
                  ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              Home
            </Link>
            <Link
              href="/product"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl transition ${
                isActive("/product")
                  ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              Products
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl transition ${
                isActive("/about")
                  ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              About
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-900 transition"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-xs font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-900 transition"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-900 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-900 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold bg-emerald-500 text-slate-950 rounded-xl"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-900 rounded-xl"
                >
                  <span>Dashboard</span>
                  <User className="w-4 h-4 text-emerald-400" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-rose-400 bg-rose-500/10 rounded-xl"
                >
                  <span>Logout</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}