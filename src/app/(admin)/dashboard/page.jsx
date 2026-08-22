"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDashboardData } from "@/store/slices/dashboardSlice";
import {
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Package,
  Clock,
  Eye,
  ExternalLink,
  Calendar,
  ChevronDown,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth || {});
  const currentUser = user?.user || user;
  const adminName = currentUser?.name || "Admin";

  const {
    stats,
    featuredProduct,
    genderBreakdown,
    chartMonths,
    allMonths,
    last24Hours,
    recentOrders,
    loading,
    lastUpdated,
  } = useSelector((state) => state.dashboard);

  // Month / Period filter state: "24H", "12M", "6M", "3M", or "YYYY-MM"
  const [selectedPeriod, setSelectedPeriod] = useState("6M");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Initial load and live 30-second interval polling
  useEffect(() => {
    dispatch(fetchDashboardData());

    const interval = setInterval(() => {
      dispatch(fetchDashboardData());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Format currency
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num >= 1000
      ? `₹${(num / 1000).toFixed(1)}k`
      : `₹${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Stat cards with dynamic real-time values & sparklines
  const statCards = [
    {
      title: "Product sold",
      value: (stats.totalUnitsSold || 0).toLocaleString(),
      change: `+${stats.dailyGrowth || 2.6}%`,
      note: "vs yesterday",
      accent: "emerald",
      points: "M8 36 C28 56, 40 10, 58 22 S88 8, 104 26 S126 24, 140 38",
    },
    {
      title: "Total balance",
      value: `₹${(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${stats.monthlyGrowth >= 0 ? "+" : ""}${stats.monthlyGrowth || 0}%`,
      note: "this month",
      accent: stats.monthlyGrowth >= 0 ? "emerald" : "amber",
      points:
        "M8 24 C24 18, 34 42, 48 46 S78 12, 92 16 S110 50, 124 42 S138 16, 140 26",
    },
    {
      title: "Sales profit",
      value: `₹${(stats.estimatedProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+26%",
      note: "est. margin",
      accent: "orange",
      points:
        "M8 44 C22 44, 30 14, 48 14 S78 44, 96 44 S118 62, 132 26 S138 20, 140 16",
    },
  ];

  // 12 Months full list with fallback
  const monthsDataset = useMemo(() => {
    if (Array.isArray(allMonths) && allMonths.length > 0) return allMonths;
    if (Array.isArray(chartMonths) && chartMonths.length > 0) return chartMonths;
    const now = new Date();
    const monthsNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fullNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const list = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      list.push({
        id: `${y}-${String(m).padStart(2, "0")}`,
        label: monthsNames[d.getMonth()],
        fullLabel: `${fullNames[d.getMonth()]} ${y}`,
        monthName: fullNames[d.getMonth()],
        year: y,
        month: m,
        revenue: 0,
        orders: 0,
        weeks: [
          { label: "W1 (1-7)", revenue: 0, orders: 0 },
          { label: "W2 (8-14)", revenue: 0, orders: 0 },
          { label: "W3 (15-21)", revenue: 0, orders: 0 },
          { label: "W4 (22+)", revenue: 0, orders: 0 },
        ],
      });
    }
    return list;
  }, [allMonths, chartMonths]);

  // Compute active filtered data points according to admin selection
  const {
    activePoints,
    periodTotalRevenue,
    periodTotalOrders,
    periodLabel,
    isSpecificMonth,
    is24H,
  } = useMemo(() => {
    if (selectedPeriod === "24H") {
      const pts =
        Array.isArray(last24Hours) && last24Hours.length > 0
          ? last24Hours
          : [
              { label: "00:00", fullLabel: "00:00 - 04:00", revenue: 0, orders: 0 },
              { label: "04:00", fullLabel: "04:00 - 08:00", revenue: 0, orders: 0 },
              { label: "08:00", fullLabel: "08:00 - 12:00", revenue: 0, orders: 0 },
              { label: "12:00", fullLabel: "12:00 - 16:00", revenue: 0, orders: 0 },
              { label: "16:00", fullLabel: "16:00 - 20:00", revenue: 0, orders: 0 },
              { label: "20:00", fullLabel: "20:00 - 00:00", revenue: 0, orders: 0 },
            ];
      const rev = pts.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const ord = pts.reduce((sum, item) => sum + (item.orders || 0), 0);
      return {
        activePoints: pts.map((h) => ({
          label: h.label,
          fullLabel: h.fullLabel || h.label,
          revenue: h.revenue || 0,
          orders: h.orders || 0,
        })),
        periodTotalRevenue: rev,
        periodTotalOrders: ord,
        periodLabel: "Last 24 Hours",
        isSpecificMonth: false,
        is24H: true,
      };
    }

    if (selectedPeriod === "3M") {
      const subset = monthsDataset.slice(-3);
      const rev = subset.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const ord = subset.reduce((sum, item) => sum + (item.orders || 0), 0);
      return {
        activePoints: subset.map((m) => ({
          label: m.label,
          fullLabel: m.fullLabel || m.label,
          revenue: m.revenue || 0,
          orders: m.orders || 0,
        })),
        periodTotalRevenue: rev,
        periodTotalOrders: ord,
        periodLabel: "Last 3 Months",
        isSpecificMonth: false,
        is24H: false,
      };
    }

    if (selectedPeriod === "6M") {
      const subset = monthsDataset.slice(-6);
      const rev = subset.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const ord = subset.reduce((sum, item) => sum + (item.orders || 0), 0);
      return {
        activePoints: subset.map((m) => ({
          label: m.label,
          fullLabel: m.fullLabel || m.label,
          revenue: m.revenue || 0,
          orders: m.orders || 0,
        })),
        periodTotalRevenue: rev,
        periodTotalOrders: ord,
        periodLabel: "Last 6 Months",
        isSpecificMonth: false,
        is24H: false,
      };
    }

    if (selectedPeriod === "12M" || selectedPeriod === "all") {
      const rev = monthsDataset.reduce((sum, item) => sum + (item.revenue || 0), 0) || stats.totalRevenue;
      const ord = monthsDataset.reduce((sum, item) => sum + (item.orders || 0), 0) || stats.totalOrdersCount;
      return {
        activePoints: monthsDataset.map((m) => ({
          label: m.label,
          fullLabel: m.fullLabel || m.label,
          revenue: m.revenue || 0,
          orders: m.orders || 0,
        })),
        periodTotalRevenue: rev,
        periodTotalOrders: ord,
        periodLabel: "Full Year (12 Months)",
        isSpecificMonth: false,
        is24H: false,
      };
    }

    // Specific month selected
    const monthItem = monthsDataset.find((m) => m.id === selectedPeriod) || monthsDataset[monthsDataset.length - 1];
    const weeks = monthItem?.weeks || [
      { label: "W1 (1-7)", revenue: 0, orders: 0 },
      { label: "W2 (8-14)", revenue: 0, orders: 0 },
      { label: "W3 (15-21)", revenue: 0, orders: 0 },
      { label: "W4 (22+)", revenue: 0, orders: 0 },
    ];

    return {
      activePoints: weeks.map((w) => ({
        label: w.label,
        fullLabel: `${monthItem?.fullLabel || "Selected Month"} • ${w.label}`,
        revenue: w.revenue || 0,
        orders: w.orders || 0,
      })),
      periodTotalRevenue: monthItem?.revenue || 0,
      periodTotalOrders: monthItem?.orders || 0,
      periodLabel: monthItem?.fullLabel || "Selected Month",
      isSpecificMonth: true,
      is24H: false,
    };
  }, [selectedPeriod, monthsDataset, last24Hours, stats.totalRevenue, stats.totalOrdersCount]);

  // Compute dynamic bar coordinates and heights
  const maxPeriodRevenue = Math.max(...activePoints.map((p) => p.revenue), 100);
  const chartBars = activePoints.map((p, idx) => {
    const ratio = p.revenue > 0 ? Math.max(0.18, p.revenue / maxPeriodRevenue) : 0.08;
    const totalBars = activePoints.length;
    const step = 84 / Math.max(1, totalBars);
    const leftPercent = 8 + idx * step + step * 0.15;

    return {
      left: `${leftPercent}%`,
      width: totalBars <= 4 ? "w-7 sm:w-10" : totalBars <= 6 ? "w-4 sm:w-7" : "w-2.5 sm:w-4 md:w-5",
      height: Math.round(ratio * 96),
      color:
        idx % 3 === 0
          ? "bg-emerald-500 shadow-emerald-500/20"
          : idx % 3 === 1
          ? "bg-amber-400 shadow-amber-400/20"
          : "bg-teal-400 shadow-teal-400/20",
      label: p.label,
      fullLabel: p.fullLabel,
      revenue: p.revenue,
      orders: p.orders,
    };
  });

  // Generate dynamic spline curves matching active data points
  const { salesCurveA, salesCurveB } = useMemo(() => {
    const count = activePoints.length;
    if (count === 0) {
      return {
        salesCurveA: "M0 150 L500 150",
        salesCurveB: "M0 145 L500 145",
      };
    }

    const svgPointsA = activePoints.map((p, idx) => {
      const x = count === 1 ? 250 : (idx / (count - 1)) * 480 + 10;
      const ratio = p.revenue / maxPeriodRevenue;
      const y = Math.round(155 - ratio * 125);
      return { x, y };
    });

    const maxOrders = Math.max(...activePoints.map((p) => p.orders), 1);
    const svgPointsB = activePoints.map((p, idx) => {
      const x = count === 1 ? 250 : (idx / (count - 1)) * 480 + 10;
      const ratio = p.orders / maxOrders;
      const y = Math.round(160 - ratio * 75);
      return { x, y };
    });

    const buildPath = (pts) => {
      if (pts.length === 1) return `M0 ${pts[0].y} L500 ${pts[0].y}`;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? 0 : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const cp1x = Math.round(p1.x + (p2.x - p0.x) / 6);
        const cp1y = Math.round(p1.y + (p2.y - p0.y) / 6);
        const cp2x = Math.round(p2.x - (p3.x - p1.x) / 6);
        const cp2y = Math.round(p2.y - (p3.y - p1.y) / 6);
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      return d;
    };

    return {
      salesCurveA: buildPath(svgPointsA),
      salesCurveB: buildPath(svgPointsB),
    };
  }, [activePoints, maxPeriodRevenue]);

  // Demographic Circular Progress Calculations (Starting from single point at 12 o'clock)
  const menPct = Math.min(100, Math.max(0, genderBreakdown?.menPercent ?? 45));
  const womenPct = Math.min(100, Math.max(0, genderBreakdown?.womenPercent ?? 35));
  const kidsPct = Math.min(100, Math.max(0, genderBreakdown?.kidsPercent ?? 20));

  // Circular gauge constants
  // Outer (Men): r=105, C=659.73
  const menCircumference = 2 * Math.PI * 105;
  const menDashOffset = menCircumference * (1 - menPct / 100);

  // Middle (Women): r=82, C=515.22
  const womenCircumference = 2 * Math.PI * 82;
  const womenDashOffset = womenCircumference * (1 - womenPct / 100);

  // Inner (Kids): r=59, C=370.71
  const kidsCircumference = 2 * Math.PI * 59;
  const kidsDashOffset = kidsCircumference * (1 - kidsPct / 100);

  const miniProgress = [
    {
      label: "Current Month Sales",
      value: formatCurrency(stats.thisMonthRevenue),
      width: `${Math.min(100, Math.max(25, stats.monthlyGrowth > 0 ? stats.monthlyGrowth : 68))}%`,
      accent: "bg-emerald-500",
    },
    {
      label: "Orders Fulfilled",
      value: `${stats.completionRate || 85}%`,
      width: `${stats.completionRate || 85}%`,
      accent: "bg-sky-500",
    },
    {
      label: "Active Catalog",
      value: `${stats.allProductsCount || 0} items`,
      width: "83%",
      accent: "bg-amber-400",
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* REAL-TIME STATUS BAR */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-semibold text-slate-600">
            Real-time Live Analytics
          </span>
          {lastUpdated && (
            <span className="text-slate-400 hidden sm:inline">
              • Auto-refreshes every 30s
            </span>
          )}
        </div>

        <button
          onClick={() => dispatch(fetchDashboardData())}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-xs hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* HERO BANNERS */}
      <section className="grid gap-4 xl:grid-cols-[1.95fr_0.95fr]">
        {/* Banner 1: Dynamic Congratulations & Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(33,196,142,0.14),_transparent_35%),linear-gradient(135deg,#181f2c_0%,#103441_55%,#0b465c_100%)] p-7 text-white shadow-xl shadow-slate-900/10"
        >
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_65%_35%,rgba(95,255,204,0.18),transparent_18%),radial-gradient(circle_at_55%_70%,rgba(94,234,212,0.08),transparent_24%)]" />
          <div className="relative flex min-h-[215px] flex-col justify-between md:flex-row md:items-center">
            <div className="max-w-sm">
              <motion.p
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl font-bold leading-tight"
              >
                Welcome back,
                <br />
                {adminName}
              </motion.p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
                Store performance is up with{" "}
                <span className="text-emerald-400 font-bold">
                  {stats.totalOrdersCount || 0} total orders
                </span>{" "}
                and {stats.allProductsCount || 0} products active.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Link
                  href="/dashboard/orders"
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 inline-block"
                >
                  Manage Orders
                </Link>
                <Link
                  href="/dashboard/inventory"
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition inline-block"
                >
                  Inventory Hub
                </Link>
              </div>
            </div>

            <div className="relative mt-10 flex items-center justify-center md:mt-0 md:w-[320px]">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute h-44 w-44 rounded-full bg-emerald-300/12 blur-md"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="relative rounded-full border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-inner"
              >
                <div className="flex items-end gap-3">
                  <motion.div
                    animate={{ height: ["50%", "100%", "50%"] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="h-16 w-3 rounded-full bg-emerald-200"
                  />
                  <motion.div
                    animate={{ height: ["80%", "40%", "80%"] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                    className="h-11 w-3 rounded-full bg-emerald-300"
                  />
                  <motion.div
                    animate={{ height: ["30%", "90%", "30%"] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="h-7 w-3 rounded-full bg-emerald-400"
                  />
                </div>
                <div className="absolute -left-7 bottom-8 h-12 w-12 rounded-full border-4 border-r-transparent border-t-transparent border-white/70" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute right-0 top-1/2 flex h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/8 backdrop-blur-xs"
              >
                <div className="relative h-16 w-16">
                  <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-orange-200" />
                  <div className="absolute left-1/2 top-4 h-10 w-8 -translate-x-1/2 rounded-full bg-orange-300" />
                  <div className="absolute left-0 top-5 h-6 w-6 rounded-full bg-emerald-200/80" />
                  <div className="absolute right-0 top-5 h-6 w-6 rounded-full bg-emerald-200/80" />
                  <div className="absolute bottom-0 left-3 h-8 w-2 rotate-[18deg] rounded-full bg-white" />
                  <div className="absolute bottom-0 right-3 h-8 w-2 rotate-[-18deg] rounded-full bg-white" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Banner 2: Live Featured / Spotlight Product */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#ffb100_0%,#ec7a26_28%,#151515_70%,#060606_100%)] p-5 text-white shadow-xl shadow-slate-900/10"
        >
          <motion.div
            animate={{ rotate: [-8, -6, -8] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute right-[-10px] top-4 h-40 w-64 rotate-[-8deg] rounded-[32px] bg-[linear-gradient(145deg,#faf7ef,#d5d7d8_45%,#8b8f93)] opacity-95 shadow-[0_30px_50px_-20px_rgba(0,0,0,0.55)]"
          />
          <motion.div
            animate={{ rotate: [7, 9, 7] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute right-6 top-20 h-28 w-60 rotate-[7deg] rounded-[32px] bg-[linear-gradient(145deg,#fdfbf6,#cfd2d5_40%,#7d8489)] opacity-85 shadow-[0_25px_45px_-25px_rgba(0,0,0,0.7)]"
          />
          <div className="relative flex min-h-[215px] flex-col justify-end">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-100/75">
              Spotlight Catalog
            </span>
            <h2 className="mt-3 max-w-[220px] text-2xl sm:text-3xl font-bold leading-tight line-clamp-2">
              {featuredProduct?.name || "Featured Product"}
            </h2>
            {featuredProduct ? (
              <Link
                href={`/product/${featuredProduct._id}`}
                target="_blank"
                className="mt-6 w-fit rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition inline-flex items-center gap-1.5"
              >
                <span>View Product</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/dashboard/products/add"
                className="mt-6 w-fit rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
              >
                Add Product
              </Link>
            )}
            <div className="mt-8 flex gap-2 self-end">
              {[0.5, 0.7, 1, 0.7].map((opacity, index) => (
                <motion.span
                  key={index}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    delay: index * 0.2,
                  }}
                  className="h-2.5 w-2.5 rounded-full bg-emerald-300"
                  style={{ opacity }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* STAT CARDS ROW */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
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
            <motion.section
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="rounded-[16px] border border-slate-200/80 bg-white p-5 shadow-[0_15px_30px_-15px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <h3 className="mt-3 text-[2rem] font-bold leading-none text-slate-800">
                    {card.value}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
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
                    </motion.span>
                    <span className="font-semibold text-slate-700">
                      {card.change}
                    </span>
                    <span className="text-slate-400">{card.note}</span>
                  </div>
                </div>

                <svg viewBox="0 0 148 64" className="h-16 w-36">
                  <motion.path
                    d={card.points}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 1.4,
                      delay: 0.2 + index * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
              </div>
            </motion.section>
          );
        })}
      </section>

      {/* CHARTS SECTION */}
      <section className="grid gap-4 xl:grid-cols-[0.95fr_2.05fr]">
        {/* Demographic Radial 100% Progress Ring Chart */}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-800">
                Catalog by Demographic
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution breakdown across active products
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              <Layers className="w-3 h-3 text-slate-500" />
              {genderBreakdown.total || stats.allProductsCount || 0} Total
            </span>
          </div>

          {/* SVG Concentric Gauge: All 3 Rings start from Single Point (12 o'clock), 100% Base Track */}
          <div className="relative mx-auto my-4 sm:my-6 flex h-[220px] w-[220px] xs:h-[250px] xs:w-[250px] sm:h-[280px] sm:w-[280px] max-w-full aspect-square items-center justify-center">
            <svg viewBox="0 0 300 300" className="h-full w-full">
              <defs>
                <linearGradient id="menRadialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="womenRadialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="kidsRadialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>

              {/* Unified 12 O'Clock Single Starting Point Marker */}
              <line
                x1="150"
                y1="34"
                x2="150"
                y2="44"
                stroke="#cbd5e1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* 1. OUTER RING (MEN): 100% Track & Dynamic Progress */}
              <circle
                cx="150"
                cy="150"
                r="105"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="11"
              />
              <motion.circle
                cx="150"
                cy="150"
                r="105"
                fill="none"
                stroke="url(#menRadialGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={menCircumference}
                initial={{ strokeDashoffset: menCircumference }}
                animate={{ strokeDashoffset: menDashOffset }}
                transition={{ duration: 1.4, delay: 0.35, ease: "easeOut" }}
                transform="rotate(-90 150 150)"
              />

              {/* 2. MIDDLE RING (WOMEN): 100% Track & Dynamic Progress */}
              <circle
                cx="150"
                cy="150"
                r="82"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="11"
              />
              <motion.circle
                cx="150"
                cy="150"
                r="82"
                fill="none"
                stroke="url(#womenRadialGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={womenCircumference}
                initial={{ strokeDashoffset: womenCircumference }}
                animate={{ strokeDashoffset: womenDashOffset }}
                transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
                transform="rotate(-90 150 150)"
              />

              {/* 3. INNER RING (KIDS): 100% Track & Dynamic Progress */}
              <circle
                cx="150"
                cy="150"
                r="59"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="11"
              />
              <motion.circle
                cx="150"
                cy="150"
                r="59"
                fill="none"
                stroke="url(#kidsRadialGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={kidsCircumference}
                initial={{ strokeDashoffset: kidsCircumference }}
                animate={{ strokeDashoffset: kidsDashOffset }}
                transition={{ duration: 1.4, delay: 0.65, ease: "easeOut" }}
                transform="rotate(-90 150 150)"
              />
            </svg>

            {/* Center Gauge Stats */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="absolute text-center select-none"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Total Products
              </span>
              <span className="text-3xl font-black text-slate-900 block leading-tight mt-0.5 font-mono">
                {stats.allProductsCount || 0}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
                Active Catalog
              </span>
            </motion.div>
          </div>

          {/* Demographic Linear 100% Progress Bars starting from Single Left Point */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {/* Men */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Men ({genderBreakdown.men || 0} items)
                </span>
                <span className="font-mono text-emerald-600 font-bold">{menPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${menPct}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>

            {/* Women */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Women ({genderBreakdown.women || 0} items)
                </span>
                <span className="font-mono text-amber-600 font-bold">{womenPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${womenPct}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-amber-400"
                />
              </div>
            </div>

            {/* Kids */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  Kids ({genderBreakdown.kids || 0} items)
                </span>
                <span className="font-mono text-orange-600 font-bold">{kidsPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${kidsPct}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-orange-400"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* MONTHLY SALES & REVENUE TRENDS WITH INTERACTIVE MONTH SELECTOR */}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)] flex flex-col justify-between"
        >
          {/* Header with Monthly Controls */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-slate-800">
                  Sales & Revenue Trends
                </p>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                  {periodLabel}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {is24H
                  ? "Viewing hourly revenue and order velocity across the last 24 hours"
                  : isSpecificMonth
                  ? "Viewing weekly breakdown and trends for the selected month"
                  : `Real-time monthly revenue and order trends (+${stats.monthlyGrowth || 0}% growth)`}
              </p>
            </div>

            {/* Month & Period Selectors */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto">
              {/* Quick Preset Buttons */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => setSelectedPeriod("24H")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPeriod === "24H"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  24H
                </button>
                <button
                  onClick={() => setSelectedPeriod("3M")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPeriod === "3M"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  3M
                </button>
                <button
                  onClick={() => setSelectedPeriod("6M")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPeriod === "6M"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  6M
                </button>
                <button
                  onClick={() => setSelectedPeriod("12M")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPeriod === "12M"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  12M
                </button>
              </div>

              {/* Month Dropdown Picker */}
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
                >
                  <optgroup label="Ranges">
                    <option value="24H">Last 24 Hours</option>
                    <option value="6M">Last 6 Months</option>
                    <option value="3M">Last 3 Months</option>
                    <option value="12M">Full Year (12 Months)</option>
                  </optgroup>
                  <optgroup label="Select Specific Month">
                    {monthsDataset.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullLabel || m.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Dynamic Summary Cards for Selected Period */}
          <div className="mt-5 flex flex-wrap items-center gap-8">
            <div className="flex items-start gap-2.5">
              <span className="mt-2 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {is24H ? "24H Revenue" : isSpecificMonth ? "Month Revenue" : "Period Revenue"}
                </p>
                <p className="mt-0.5 text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                  {formatCurrency(periodTotalRevenue)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="mt-2 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-amber-400/10" />
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {is24H ? "24H Orders" : isSpecificMonth ? "Month Orders" : "Period Orders"}
                </p>
                <p className="mt-0.5 text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                  {periodTotalOrders.toLocaleString()}{" "}
                  <span className="text-xs text-slate-400 font-normal">orders</span>
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Bar & Spline SVG Chart */}
          <div className="relative mt-6 overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbfc_100%)] px-4 pb-6 pt-10 border border-slate-100">
            {/* Horizontal Grid Guides */}
            <div className="pointer-events-none absolute inset-x-4 inset-y-0">
              {[0, 1, 2, 3].map((line) => (
                <div
                  key={line}
                  className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                  style={{ top: `${22 + line * 22}%` }}
                />
              ))}
            </div>

            {/* Interactive Bars Container */}
            <div className="absolute bottom-7 left-4 right-4 top-8 pointer-events-auto">
              <div className="absolute inset-x-0 bottom-0 h-24 rounded-full bg-emerald-200/20 blur-2xl pointer-events-none" />

              {chartBars.map((bar, index) => (
                <div
                  key={bar.label + index}
                  className="absolute bottom-0 flex flex-col items-center group cursor-pointer"
                  style={{
                    left: bar.left,
                    transform: "translateX(-50%)",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip on Hover */}
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-2 z-30 pointer-events-none whitespace-nowrap rounded-xl bg-slate-900 text-white px-3 py-2 text-xs shadow-xl"
                      >
                        <p className="font-semibold text-slate-300 text-[10px]">
                          {bar.fullLabel}
                        </p>
                        <p className="font-bold text-emerald-400 font-mono">
                          {formatCurrency(bar.revenue)}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          {bar.orders} {bar.orders === 1 ? "order" : "orders"}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Colored Bar */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2 + index * 0.05,
                      ease: "easeOut",
                    }}
                    className={`rounded-t-2xl ${bar.width} ${bar.color} transition-all duration-200 group-hover:brightness-110 shadow-md`}
                    style={{
                      height: `${bar.height}px`,
                      transformOrigin: "bottom",
                    }}
                  />

                  {/* Label under Bar */}
                  <span className="mt-2 text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap group-hover:text-slate-900 transition text-center">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Dynamic SVG Wave Overlays */}
            <svg
              viewBox="0 0 500 180"
              className="relative z-10 h-[200px] sm:h-[240px] w-full pointer-events-none"
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
                fill="rgba(16, 185, 129, 0.08)"
              />
              <motion.path
                key={selectedPeriod + "_curveA"}
                d={salesCurveA}
                fill="none"
                stroke="url(#incomeStroke)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              <motion.path
                key={selectedPeriod + "_curveB"}
                d={salesCurveB}
                fill="none"
                stroke="url(#expenseStroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.15, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </motion.section>
      </section>

      {/* CAMPAIGN PERFORMANCE & QUICK INSIGHT */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-800">
                Operations Performance
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Monthly revenue, order fulfillment, and catalog health
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Live Feed
            </div>
          </div>

          <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-3">
            {miniProgress.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.5 + idx * 0.1 }}
                whileHover={{ y: -3 }}
                className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100/80 transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-800">
                  {item.value}
                </p>
                <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.width }}
                    transition={{
                      duration: 1,
                      delay: 0.6 + idx * 0.1,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${item.accent}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)]"
        >
          <p className="text-lg font-semibold text-slate-800">
            Quick insight
          </p>
          <div className="mt-6 rounded-[24px] bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Revenue target
            </p>
            <p className="mt-3 text-3xl sm:text-4xl font-bold">
              ₹{(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
              {stats.pendingOrdersCount > 0
                ? `${stats.pendingOrdersCount} orders are currently in the queue ready for fulfillment.`
                : "All orders are fulfilled. Warehouse inventory is in healthy standing."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, Math.max(20, stats.completionRate || 80))}%`,
                  }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-emerald-400"
                />
              </div>
              <span className="text-sm font-semibold text-emerald-300">
                {stats.completionRate || 85}%
              </span>
            </div>
          </div>
        </motion.section>
      </section>

      {/* RECENT LIVE ORDERS TABLE (Seamlessly styled) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="rounded-[28px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Recent Live Orders
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest transactions placed across your online store
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition flex items-center gap-1 w-fit"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const statusBg =
                    order.orderStatus === "delivered"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : order.orderStatus === "cancelled"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-800 border-amber-200";

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      <td className="py-3.5 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-800">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        {order.itemsCount} item{order.itemsCount > 1 ? "s" : ""}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">
                        ₹{(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${statusBg}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
