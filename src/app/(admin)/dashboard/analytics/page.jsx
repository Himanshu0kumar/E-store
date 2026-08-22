"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

const analyticsStats = [
  {
    title: "Total Revenue",
    value: "₹124,560.00",
    change: "+14.2%",
    isPositive: true,
    icon: DollarSign,
    accent: "emerald",
  },
  {
    title: "Active Users",
    value: "8,420",
    change: "+8.7%",
    isPositive: true,
    icon: Users,
    accent: "sky",
  },
  {
    title: "Total Orders",
    value: "3,150",
    change: "+12.4%",
    isPositive: true,
    icon: ShoppingBag,
    accent: "indigo",
  },
  {
    title: "Conversion Rate",
    value: "3.42%",
    change: "-0.5%",
    isPositive: false,
    icon: TrendingUp,
    accent: "amber",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track key business metrics, sales conversion, and customer engagement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition">
            Export Report
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.title}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                    stat.isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {stat.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ANALYTICS CHARTS PLACEHOLDER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Traffic & Conversion Performance</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time overview of monthly visitors</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            Live Stream
          </span>
        </div>

        <div className="mt-6 h-64 w-full flex items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
          [ Analytics Overview Chart Data ]
        </div>
      </motion.div>
    </div>
  );
}
