"use client";
import { useState } from "react";

const overviewItems = [
  { label: "App", icon: "home" },
  { label: "Ecommerce", icon: "bag", active: true },
  { label: "Analytics", icon: "chart" },
  { label: "Banking", icon: "bank" },
  { label: "Booking", icon: "plane" },
  { label: "File", icon: "file" },
  { label: "Course", icon: "book" },
];

const managementItems = [
  {
    label: "User",
    icon: "user",
    children: [
      { label: "List User" },
      { label: "Create User" },
      { label: "Roles & Permissions" },
    ],
  },
  {
    label: "Product",
    icon: "box",
    children: [
      { label: "List Product" },
      { label: "Add Product" },
      { label: "Categories" },
    ],
  },
  {
    label: "Order",
    icon: "cart",
    children: [
      { label: "All Orders" },
      { label: "Pending" },
      { label: "Completed" },
    ],
  },
  { label: "Invoice", icon: "receipt" },
  { label: "Blog", icon: "chat" },
  { label: "Job", icon: "briefcase" },
  { label: "Tour", icon: "compass" },
  { label: "File manager", icon: "folder" },
  { label: "Mail", icon: "mail", badge: "+32" },
  { label: "Chat", icon: "message" },
];

const statCards = [
  {
    title: "Product sold",
    value: "765",
    change: "+2.6%",
    note: "last week",
    accent: "emerald",
    points: "M8 36 C28 56, 40 10, 58 22 S88 8, 104 26 S126 24, 140 38",
  },
  {
    title: "Total balance",
    value: "18,765",
    change: "-0.1%",
    note: "last week",
    accent: "amber",
    points:
      "M8 24 C24 18, 34 42, 48 46 S78 12, 92 16 S110 50, 124 42 S138 16, 140 26",
  },
  {
    title: "Sales profit",
    value: "4,876",
    change: "+0.6%",
    note: "last week",
    accent: "orange",
    points:
      "M8 44 C22 44, 30 14, 48 14 S78 44, 96 44 S118 62, 132 26 S138 20, 140 16",
  },
];

const chartBars = [
  { left: "8%", height: 70, color: "bg-emerald-400/85" },
  { left: "16%", height: 94, color: "bg-emerald-300/80" },
  { left: "24%", height: 58, color: "bg-emerald-200/90" },
  { left: "42%", height: 44, color: "bg-amber-300/90" },
  { left: "50%", height: 84, color: "bg-amber-400/90" },
  { left: "58%", height: 62, color: "bg-amber-200/90" },
];

const salesCurveA =
  "M0 150 C50 142, 68 68, 118 80 S188 154, 242 128 S304 40, 364 82 S430 160, 500 124";
const salesCurveB =
  "M0 142 C48 158, 92 102, 144 118 S218 150, 274 138 S346 148, 398 118 S462 128, 500 136";

const miniProgress = [
  {
    label: "Current week",
    value: "68.4%",
    width: "68%",
    accent: "bg-emerald-500",
  },
  {
    label: "Orders completed",
    value: "74.8%",
    width: "75%",
    accent: "bg-sky-500",
  },
  {
    label: "Revenue growth",
    value: "83.2%",
    width: "83%",
    accent: "bg-amber-400",
  },
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

function NavItem({ item }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      {/* Parent */}
      <div
        onClick={() => hasChildren && setOpen(!open)}
        className={`group flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
          item.active
            ? "bg-emerald-50 text-emerald-700"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              item.active
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-400 group-hover:bg-white"
            }`}
          >
            <SidebarIcon type={item.icon} />
          </span>
          <span className="font-medium">{item.label}</span>
        </div>

        {hasChildren ? (
          <span className="text-slate-400">{open ? "⌄" : ">"}</span>
        ) : item.badge ? (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
            {item.badge}
          </span>
        ) : (
          <span className="text-slate-300">{!item.active && ">"}</span>
        )}
      </div>

      {/* Submenu */}
      {hasChildren && open && (
        <div className="ml-11 mt-1 space-y-1">
          {item.children.map((sub) => (
            <div
              key={sub.label}
              className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              {sub.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ card }) {
  const trendBg =
    card.accent === "emerald"
      ? "bg-emerald-100 text-emerald-600"
      : card.accent === "amber"
        ? "bg-rose-100 text-rose-500"
        : "bg-emerald-100 text-emerald-600";

  const stroke =
    card.accent === "emerald"
      ? "#22c55e"
      : card.accent === "amber"
        ? "#f59e0b"
        : "#fb923c";

  return (
    <section className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{card.title}</p>
          <h3 className="mt-3 text-[2rem] font-bold leading-none text-slate-800">
            {card.value}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${trendBg}`}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </span>
            <span className="font-semibold text-slate-700">{card.change}</span>
            <span className="text-slate-400">{card.note}</span>
          </div>
        </div>

        <svg viewBox="0 0 148 64" className="h-16 w-36">
          <path
            d={card.points}
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f5f8fb] text-slate-900">
      
      <div className="flex  w-full ">
        
      <aside className="hidden w-[250px] shrink-0 border-r border-slate-200 bg-white px-5 py-6 xl:block h-screen overflow-y-auto sticky top-0">
      {/* <aside className="sidebar-scroll hidden w-[250px] shrink-0 border-r border-slate-200 bg-white px-5 py-6 xl:block h-screen sticky top-0"> */}
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
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Management
            </p>
            <div className="mt-3 space-y-1">
              {managementItems.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto bg-transparent">
          {/* <div className=" bg-white px-4 py-4 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-5 lg:px-7"> */}
          <div className="sticky top-0 z-50 bg-white px-4 py-4 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-5 lg:px-7">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
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

            <section className="mt-6 grid gap-4 xl:grid-cols-[1.95fr_0.95fr]">
              <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(33,196,142,0.14),_transparent_35%),linear-gradient(135deg,#181f2c_0%,#103441_55%,#0b465c_100%)] p-7 text-white">
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_65%_35%,rgba(95,255,204,0.18),transparent_18%),radial-gradient(circle_at_55%_70%,rgba(94,234,212,0.08),transparent_24%)]" />
                <div className="relative flex min-h-[215px] flex-col justify-between md:flex-row md:items-center">
                  <div className="max-w-sm">
                    <p className="text-3xl font-bold leading-tight">
                      Congratulations
                      <br />
                      Jaydon Frankie
                    </p>
                    <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
                      Best seller of the month, you have done 57.6% more sales
                      today.
                    </p>
                    <button className="mt-6 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400">
                      Go now
                    </button>
                  </div>

                  <div className="relative mt-10 flex items-center justify-center md:mt-0 md:w-[320px]">
                    <div className="absolute h-44 w-44 rounded-full bg-emerald-300/12 blur-md" />
                    <div className="relative rounded-full border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                      <div className="flex items-end gap-3">
                        <div className="h-16 w-3 rounded-full bg-emerald-200" />
                        <div className="h-11 w-3 rounded-full bg-emerald-300" />
                        <div className="h-7 w-3 rounded-full bg-emerald-400" />
                      </div>
                      <div className="absolute -left-7 bottom-8 h-12 w-12 rounded-full border-4 border-r-transparent border-t-transparent border-white/70" />
                    </div>
                    <div className="absolute right-0 top-1/2 flex h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/8">
                      <div className="relative h-16 w-16">
                        <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-orange-200" />
                        <div className="absolute left-1/2 top-4 h-10 w-8 -translate-x-1/2 rounded-full bg-orange-300" />
                        <div className="absolute left-0 top-5 h-6 w-6 rounded-full bg-emerald-200/80" />
                        <div className="absolute right-0 top-5 h-6 w-6 rounded-full bg-emerald-200/80" />
                        <div className="absolute bottom-0 left-3 h-8 w-2 rotate-[18deg] rounded-full bg-white" />
                        <div className="absolute bottom-0 right-3 h-8 w-2 rotate-[-18deg] rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#ffb100_0%,#ec7a26_28%,#151515_70%,#060606_100%)] p-5 text-white">
                <div className="absolute right-[-10px] top-4 h-40 w-64 rotate-[-8deg] rounded-[32px] bg-[linear-gradient(145deg,#faf7ef,#d5d7d8_45%,#8b8f93)] opacity-95 shadow-[0_30px_50px_-20px_rgba(0,0,0,0.55)]" />
                <div className="absolute right-6 top-20 h-28 w-60 rotate-[7deg] rounded-[32px] bg-[linear-gradient(145deg,#fdfbf6,#cfd2d5_40%,#7d8489)] opacity-85 shadow-[0_25px_45px_-25px_rgba(0,0,0,0.7)]" />
                <div className="relative flex min-h-[215px] flex-col justify-end">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-100/75">
                    New
                  </span>
                  <h2 className="mt-3 max-w-[220px] text-3xl font-bold leading-tight">
                    Mountain Trekking Boots
                  </h2>
                  <button className="mt-6 w-fit rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/20">
                    Buy now
                  </button>
                  <div className="mt-8 flex gap-2 self-end">
                    {[0.5, 0.7, 1, 0.7].map((opacity, index) => (
                      <span
                        key={index}
                        className="h-2.5 w-2.5 rounded-full bg-emerald-300"
                        style={{ opacity }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-3">
              {statCards.map((card) => (
                <StatCard key={card.title} card={card} />
              ))}
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_2.05fr]">
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
                <p className="text-lg font-semibold text-slate-800">
                  Sale by gender
                </p>

                <div className="relative mx-auto mt-8 flex h-[290px] w-[290px] items-center justify-center">
                  <div className="absolute h-[230px] w-[230px] rounded-full border-[10px] border-slate-100" />
                  <div className="absolute h-[230px] w-[230px] rounded-full border-[10px] border-transparent border-r-emerald-500 border-t-emerald-500 rotate-[-18deg]" />

                  <div className="absolute h-[184px] w-[184px] rounded-full border-[10px] border-slate-100" />
                  <div className="absolute h-[184px] w-[184px] rounded-full border-[10px] border-transparent border-b-amber-400 border-r-amber-400 rotate-[16deg]" />

                  <div className="absolute h-[138px] w-[138px] rounded-full border-[10px] border-slate-100" />
                  <div className="absolute h-[138px] w-[138px] rounded-full border-[10px] border-transparent border-b-orange-400 border-l-orange-300 rotate-[22deg]" />

                  <div className="relative text-center">
                    <p className="text-sm text-slate-400">Total</p>
                    <p className="mt-1 text-4xl font-bold text-slate-800">
                      2,324
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">
                      Yearly sales
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      (+43%) than last year
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500">
                    2023
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-8">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm text-slate-400">Total income</p>
                      <p className="mt-1 text-3xl font-bold text-slate-800">
                        1.23k
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div>
                      <p className="text-sm text-slate-400">Total expenses</p>
                      <p className="mt-1 text-3xl font-bold text-slate-800">
                        6.79k
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-8 overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbfc_100%)] px-4 pb-6 pt-10">
                  <div className="pointer-events-none absolute inset-x-4 inset-y-0">
                    {[0, 1, 2, 3].map((line) => (
                      <div
                        key={line}
                        className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                        style={{ top: `${22 + line * 22}%` }}
                      />
                    ))}
                  </div>

                  <div className="pointer-events-none absolute bottom-6 left-8 right-8 top-8">
                    <div className="absolute inset-x-0 bottom-0 h-24 rounded-full bg-emerald-200/20 blur-2xl" />
                    {chartBars.map((bar, index) => (
                      <div
                        key={index}
                        className={`absolute bottom-0 w-7 rounded-t-2xl ${bar.color}`}
                        style={{ left: bar.left, height: `${bar.height}px` }}
                      />
                    ))}
                  </div>

                  <svg
                    viewBox="0 0 500 180"
                    className="relative z-10 h-[240px] w-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="incomeStroke"
                        x1="0%"
                        x2="100%"
                        y1="0%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#1fc97a" />
                        <stop offset="100%" stopColor="#0ea765" />
                      </linearGradient>
                      <linearGradient
                        id="expenseStroke"
                        x1="0%"
                        x2="100%"
                        y1="0%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#f9b233" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`${salesCurveA} L500 180 L0 180 Z`}
                      fill="rgba(16, 185, 129, 0.10)"
                    />
                    <path
                      d={salesCurveA}
                      fill="none"
                      stroke="url(#incomeStroke)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d={salesCurveB}
                      fill="none"
                      stroke="url(#expenseStroke)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </section>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">
                      Campaign performance
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Weekly conversion and active traffic summary
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500">
                    Updated 2h ago
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {miniProgress.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100"
                    >
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="mt-3 text-3xl font-bold text-slate-800">
                        {item.value}
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${item.accent}`}
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
                <p className="text-lg font-semibold text-slate-800">
                  Quick insight
                </p>
                <div className="mt-6 rounded-[24px] bg-slate-900 p-5 text-white">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                    Revenue target
                  </p>
                  <p className="mt-3 text-4xl font-bold">$84.2k</p>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
                    Maintain this pace to cross your quarterly target before the
                    final month.
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-white/10">
                      <div className="h-full w-[78%] rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-300">
                      78%
                    </span>
                  </div>
                </div>
              </section>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
