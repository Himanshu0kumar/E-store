"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logoutUser, getUserProfile, openAuthModal } from "@/store/slices/authSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import { fetchWishlist } from "@/store/slices/wishlistSlice";
import AuthModal from "@/components/common/AuthModal";

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

  // Safely extract user information & avatar
  const currentUser = user?.user || user;
  const userName =
    currentUser?.name ||
    currentUser?.username ||
    (currentUser?.email ? currentUser.email.split("@")[0] : null);
  const userAvatar = currentUser?.avatar || currentUser?.image || currentUser?.profileImage;

  // Determine user dashboard link (/user/dashboard or /dashboard for admin)
  const dashboardHref = currentUser?.role === "admin" ? "/dashboard" : "/user/dashboard";

  // Fetch user profile, cart & wishlist on mount for persistent login
  useEffect(() => {
    const isLoggedOut = typeof window !== "undefined" && localStorage.getItem("isLoggedOut") === "true";
    if (!user && !isLoggedOut) {
      dispatch(getUserProfile());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    } else if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  const cartCount = cartState?.items?.length || cartState?.itemCount || 0;
  const wishlistCount = wishlistState?.items?.length || wishlistState?.totalItems || 0;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.href = "/";
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

  const handleWishlistClick = (e) => {
    if (!currentUser || !userName) {
      e.preventDefault();
      dispatch(openAuthModal({ redirect: "/wishlist", message: "Please log in to view your wishlist" }));
    }
  };

  const handleCartClick = (e) => {
    if (!currentUser || !userName) {
      e.preventDefault();
      dispatch(openAuthModal({ redirect: "/cart", message: "Please log in to view your cart" }));
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl text-slate-100 shadow-xl shadow-black/30 transition-all">
      <AuthModal />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* LOGO */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 group text-xl font-bold tracking-wider text-white hover:opacity-90 transition"
            >
              <motion.div
                whileHover={{ rotate: 12, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20"
              >
                X
              </motion.div>
              <span className="text-white">
                Shop<span className="text-emerald-400 font-extrabold">X</span>
              </span>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/product"
                className={`px-3.5 py-2 rounded-lg transition ${
                  isActive("/product")
                    ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                Products
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
                placeholder="Search products..."
                className="w-full rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 pl-10 text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* ACTION ICONS & AUTH */}
          <div className="flex items-center gap-3">
            
            {/* MOBILE SEARCH TOGGLE BUTTON */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {/* WISHLIST BUTTON */}
            <Link
              href="/wishlist"
              onClick={handleWishlistClick}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-slate-300 hover:text-rose-400 transition" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md shadow-rose-500/30"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* CART BUTTON */}
            <Link
              href="/cart"
              onClick={handleCartClick}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-300 hover:text-emerald-400 transition" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-md shadow-emerald-500/30"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* AUTH / PROFILE CONDITION (Shows User Name & Avatar if logged in, else Login / Sign Up) */}
            {!currentUser || !userName ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-900 transition"
                  title="Dashboard"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                      {userName[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate font-semibold text-slate-100">{userName}</span>
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
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* MOBILE SEARCH BAR SLIDE DOWN */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden pb-4 pt-1 overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3 overflow-hidden"
          >
            <nav className="flex flex-col gap-1 text-sm font-medium">
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
                href="/wishlist"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleWishlistClick(e);
                }}
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
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleCartClick(e);
                }}
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
              {!currentUser || !userName ? (
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
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-900 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-6 h-6 rounded-full object-cover border border-emerald-500/40"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/30">
                          {userName[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-emerald-400">{userName}</span>
                    </div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}