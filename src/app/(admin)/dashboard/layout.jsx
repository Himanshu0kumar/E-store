"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreVertical, ChevronDown, ChevronRight } from "lucide-react";

const overviewItems = [
  { label: "App", icon: "home", href: "/dashboard" },
  { label: "Ecommerce", icon: "bag", href: "/dashboard/ecommerce" },
  { label: "Analytics", icon: "chart", href: "/dashboard/analytics" },
  { label: "Banking", icon: "bank", href: "/dashboard/banking" },
  { label: "Booking", icon: "plane", href: "/dashboard/booking" },
  { label: "File", icon: "file", href: "/dashboard/file" },
  { label: "Course", icon: "book", href: "/dashboard/course" },
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
        <div
          onClick={() => setOpen(!open)}
          className={`group flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isActive
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400 group-hover:bg-white"
              }`}
            >
              <SidebarIcon type={item.icon} />
            </span>
            <span className="font-medium">{item.label}</span>
          </div>
          <span className="text-slate-400 ">
            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        </div>
      ) : (
        <Link
          href={item.href}
          className={`group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isActive
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400 group-hover:bg-white"
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
      )}

      {hasChildren && open && (
        <div className="ml-11 mt-1 space-y-1">
          {item.children.map((sub) => (
            <Link
              key={sub.href}
              href={sub.href}
              className={`block rounded-xl px-3 py-2 text-sm transition ${
                pathname === sub.href
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <main className="h-screen overflow-hidden bg-[#f5f8fb] text-slate-900">
      <div className="flex w-full">
        <aside className="hidden w-[250px] shrink-0 border-r border-slate-200 bg-white px-5 py-6 xl:block h-screen overflow-y-auto sticky top-0">
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white">
              M
            </div>
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

        <div className="min-w-0 flex-1 bg-transparent h-screen overflow-y-auto">
          <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/30 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)] sm:px-5 lg:px-7">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 py-3 min-h-[72px]">
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400">
                  &lt;
                </button>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    T
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        Team 1
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                        Free
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400">
                  <span className="text-base leading-none">S</span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-sm">
                    Ctrl K
                  </span>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  EN
                </span>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
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
                  <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                    4
                  </span>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 1-4 0 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 1 0-4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 1 4 0 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.23.3.43.64.6 1a1.7 1.7 0 0 1 0 4c-.17.36-.37.7-.6 1Z" />
                  </svg>
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 via-emerald-300 to-sky-300 p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700">
                    HF
                  </div>
                </div>
              </div>
            </header>
          </div>

          <div className="p-4">{children}</div>
        </div>
      </div>
    </main>
  );
}
