"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, getUserProfile } from "@/store/slices/authSlice";
import { MoreVertical, ChevronDown, ChevronRight, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const overviewItems = [
  { label: "Dashboard", icon: "home", href: "/dashboard" },
  { label: "Analytics", icon: "chart", href: "/dashboard/analytics" },
];

const managementItems = [
  {
    label: "User",
    icon: "user",
    children: [
      { label: "List User", href: "/dashboard/users" },
      { label: "Create User", href: "/dashboard/users/add" },
      { label: "Roles & Permissions", href: "/dashboard/users/roles" },
    ],
  },
  {
    label: "Product",
    icon: "box",
    children: [
      { label: "List Product", href: "/dashboard/products/list" },
      { label: "Add Product", href: "/dashboard/products/add" },
    ],
  },
  { label: "Category", icon: "chat", href: "/dashboard/categories" },
  { label: "Brand", icon: "chat", href: "/dashboard/brands" },
  {
    label: "Order",
    icon: "cart",
    children: [
      { label: "All Orders", href: "/dashboard/orders" },
      { label: "Pending", href: "/dashboard/orders/pending" },
      { label: "Completed", href: "/dashboard/orders/completed" },
    ],
  },
  {
    label: "Invoice",
    icon: "receipt",
    children: [
      { label: "All Orders", href: "/dashboard/orders" },
      { label: "Pending", href: "/dashboard/orders/pending" },
      { label: "Completed", href: "/dashboard/orders/completed" },
    ],
  },
  { label: "Blog", icon: "chat", href: "/dashboard/blog" },
  { label: "Reviews", icon: "star", href: "/dashboard/reviews" },
  { label: "Job", icon: "briefcase", href: "/dashboard/jobs" },
  { label: "Tour", icon: "compass", href: "/dashboard/tours" },
  { label: "File manager", icon: "folder", href: "/dashboard/files" },
  { label: "Mail", icon: "mail", href: "/dashboard/mail", badge: "+32" },
  { label: "Chat", icon: "message", href: "/dashboard/#" },
];

function SidebarIcon({ type, className = "h-4 w-4" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M6 9h12l-1 10H7L6 9Z" />
          <path d="M9 9a3 3 0 0 1 6 0" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V9" />
          <path d="M10 19V5" />
          <path d="M16 19v-7" />
          <path d="M22 19v-9" />
        </svg>
      );
    case "bank":
      return (
        <svg {...common}>
          <path d="M3 10h18" />
          <path d="M5 10v8" />
          <path d="M10 10v8" />
          <path d="M14 10v8" />
          <path d="M19 10v8" />
          <path d="M2 20h20" />
          <path d="M12 3 3 7v3h18V7l-9-4Z" />
        </svg>
      );
    case "plane":
      return (
        <svg {...common}>
          <path d="m3 11 18-8-6 18-2-7-7-3Z" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v13H7z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4 4Z" />
          <path d="M5 4v16a4 4 0 0 1 4-4h10" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m12 12 8-4.5" />
          <path d="M12 12 4 7.5" />
          <path d="M12 21v-9" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="9" cy="19" r="1.3" />
          <circle cx="17" cy="19" r="1.3" />
          <path d="M3 5h2l2.1 9.2a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L20 8H7" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...common}>
          <path d="M7 3h10v18l-3-2-2 2-2-2-3 2V3Z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M5 17 3 21l5-2h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6A3 3 0 0 0 3 7v7a3 3 0 0 0 2 3Z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <path d="M4 8h16v10H4z" />
          <path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <path d="M4 12h16" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2.8 6.2-6.2 2.8 2.8-6.2 6.2-2.8Z" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M6 18 3 21V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6Z" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    default:
      return null;
  }
}

function NavItem({ item, pathname }) {
  const hasChildren = item.children?.length > 0;
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some(
        (child) =>
          pathname === child.href || pathname.startsWith(child.href + "/"),
      );
  const [open, setOpen] = useState(isActive && hasChildren);

  return (
    <div>
      {hasChildren ? (
        <motion.div
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(!open)}
          className={`group flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition-colors duration-200 ${
            isActive
              ? "bg-emerald-50 text-emerald-700 font-semibold"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                  : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
              }`}
            >
              <SidebarIcon type={item.icon} />
            </span>
            <span className="font-medium">{item.label}</span>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-slate-400"
          >
            <ChevronDown size={18} />
          </motion.span>
        </motion.div>
      ) : (
        <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
          <Link
            href={item.href}
            className={`group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition-colors duration-200 ${
              isActive
                ? "bg-emerald-50 text-emerald-700 font-semibold"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                    : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                }`}
              >
                <SidebarIcon type={item.icon} />
              </span>
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge ? (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                {item.badge}
              </span>
            ) : (
              <span className="text-slate-300">{!isActive && ""}</span>
            )}
          </Link>
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {hasChildren && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="ml-11 mt-1 space-y-1 overflow-hidden"
          >
            {item.children.map((sub) => (
              <motion.div
                key={sub.href}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={sub.href}
                  className={`block rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                    pathname === sub.href
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {sub.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const isLoggedOut =
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggedOut") === "true";
    if (!user && !isLoggedOut) {
      dispatch(getUserProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentUser = user?.user || user;
  const adminName = currentUser?.name || "Admin User";
  const adminEmail = currentUser?.email || "admin@store.com";
  const adminAvatar = currentUser?.avatar || currentUser?.image;
  const initials =
    adminName
      ?.trim()
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase()
      ?.slice(0, 2) || "AD";

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#f5f8fb] text-slate-900">
      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm xl:hidden"
            />

            {/* Slide-over Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[70] w-[280px] border-r border-slate-200 bg-white px-5 py-6 shadow-2xl overflow-y-auto xl:hidden"
            >
              <div className="flex items-center justify-between px-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-md shadow-emerald-500/20">
                    M
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-base">ShopX</span>
                    <p className="text-xs text-slate-400">Admin Panel</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Overview
                </p>
                <div className="mt-3 space-y-1">
                  {overviewItems.map((item) => (
                    <NavItem key={item.label} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Management
                </p>
                <div className="mt-3 space-y-1">
                  {managementItems.map((item) => (
                    <NavItem key={item.label} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex w-full h-full">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-[250px] shrink-0 border-r border-slate-200 bg-white px-5 py-6 xl:block h-screen overflow-y-auto sticky top-0">
          <div className="flex items-center gap-2 px-2">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-md shadow-emerald-500/20"
            >
              M
            </motion.div>
          </div>

          <div className="mt-8">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Overview
            </p>
            <div className="mt-3 space-y-1">
              {overviewItems.map((item) => (
                <NavItem key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Management
            </p>
            <div className="mt-3 space-y-1">
              {managementItems.map((item) => (
                <NavItem key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="min-w-0 flex-1 bg-transparent h-screen overflow-y-auto">
          {/* HEADER BAR */}
          <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 shadow-xs px-3 sm:px-6">
            <header className="flex items-center justify-between gap-3 py-3 min-h-[64px]">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Menu Toggle Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileOpen(true)}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs xl:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5 text-slate-700" />
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 sm:gap-3 rounded-full border border-slate-200/80 bg-white px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-xs cursor-pointer"
                >
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-500 text-xs font-black text-white shadow-xs shadow-emerald-500/20">
                    A
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Admin Dashboard
                    </span>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-400 cursor-pointer hover:bg-slate-100 transition"
                >
                  <span className="text-xs font-semibold">Search</span>
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-xs">
                    Ctrl K
                  </span>
                </motion.div>

                <motion.span
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  EN
                </motion.span>

                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
                    <path d="M10 19a2 2 0 0 0 4 0" />
                  </svg>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 2 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white shadow-xs"
                  >
                    4
                  </motion.span>
                </motion.div>

                {/* Admin Profile Dropdown Menu & Logout Button */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    title={adminName}
                  >
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-xs sm:text-sm font-bold text-emerald-800 overflow-hidden">
                      {adminAvatar ? (
                        <img
                          src={adminAvatar}
                          alt={adminName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-60 sm:w-64 rounded-2xl bg-white p-3 shadow-xl border border-slate-200/80 z-50"
                      >
                        <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 pb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0 overflow-hidden">
                            {adminAvatar ? (
                              <img
                                src={adminAvatar}
                                alt={adminName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {adminName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {adminEmail}
                            </p>
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              Administrator
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>
          </div>

          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="p-3 sm:p-6"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
