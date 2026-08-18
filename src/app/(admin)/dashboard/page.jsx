"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

function StatCard({ card, index = 0 }) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="rounded-[16px] border border-slate-200/80 bg-white p-5 shadow-[0_15px_30px_-15px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{card.title}</p>
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
            <span className="font-semibold text-slate-700">{card.change}</span>
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
            transition={{ duration: 1.4, delay: 0.2 + index * 0.1, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </motion.section>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Hero Banners */}
      <section className="grid gap-4 xl:grid-cols-[1.95fr_0.95fr]">
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
                Congratulations
                <br />
                Jaydon Frankie
              </motion.p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
                Best seller of the month, you have done 57.6% more sales
                today.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Go now
              </motion.button>
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
              New
            </span>
            <h2 className="mt-3 max-w-[220px] text-3xl font-bold leading-tight">
              Mountain Trekking Boots
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 w-fit rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/20"
            >
              Buy now
            </motion.button>
            <div className="mt-8 flex gap-2 self-end">
              {[0.5, 0.7, 1, 0.7].map((opacity, index) => (
                <motion.span
                  key={index}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: index * 0.2 }}
                  className="h-2.5 w-2.5 rounded-full bg-emerald-300"
                  style={{ opacity }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <StatCard key={card.title} card={card} index={index} />
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid gap-4 xl:grid-cols-[0.95fr_2.05fr]">
        {/* Gender Sales Donut */}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)]"
        >
          <p className="text-lg font-semibold text-slate-800">
            Sale by gender
          </p>

          <div className="relative mx-auto mt-8 flex h-[290px] w-[290px] items-center justify-center">
            <div className="absolute h-[230px] w-[230px] rounded-full border-[10px] border-slate-100" />
            <motion.div
              initial={{ scale: 0.8, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: -18, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="absolute h-[230px] w-[230px] rounded-full border-[10px] border-transparent border-r-emerald-500 border-t-emerald-500"
            />

            <div className="absolute h-[184px] w-[184px] rounded-full border-[10px] border-slate-100" />
            <motion.div
              initial={{ scale: 0.8, rotate: -60, opacity: 0 }}
              animate={{ scale: 1, rotate: 16, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="absolute h-[184px] w-[184px] rounded-full border-[10px] border-transparent border-b-amber-400 border-r-amber-400"
            />

            <div className="absolute h-[138px] w-[138px] rounded-full border-[10px] border-slate-100" />
            <motion.div
              initial={{ scale: 0.8, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 22, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="absolute h-[138px] w-[138px] rounded-full border-[10px] border-transparent border-b-orange-400 border-l-orange-300"
            />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="relative text-center"
            >
              <p className="text-sm font-medium text-slate-400">Total</p>
              <p className="mt-1 text-4xl font-bold text-slate-800">
                2,324
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Yearly Sales Area Chart */}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-800">
                Yearly sales
              </p>
              <p className="mt-1 text-sm text-slate-400">
                (+43%) than last year
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50 transition"
            >
              2023
            </motion.div>
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
                <motion.div
                  key={index}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.08, ease: "easeOut" }}
                  className={`absolute bottom-0 w-7 rounded-t-2xl ${bar.color}`}
                  style={{ left: bar.left, height: `${bar.height}px`, transformOrigin: "bottom" }}
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
              <motion.path
                d={salesCurveA}
                fill="none"
                stroke="url(#incomeStroke)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, delay: 0.4, ease: "easeInOut" }}
              />
              <motion.path
                d={salesCurveB}
                fill="none"
                stroke="url(#expenseStroke)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, delay: 0.6, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </motion.section>
      </section>

      {/* Campaign Performance & Insight */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)]"
        >
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
                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {item.value}
                </p>
                <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.width }}
                    transition={{ duration: 1, delay: 0.6 + idx * 0.1, ease: "easeOut" }}
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
          className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.12)]"
        >
          <p className="text-lg font-semibold text-slate-800">
            Quick insight
          </p>
          <div className="mt-6 rounded-[24px] bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Revenue target
            </p>
            <p className="mt-3 text-4xl font-bold">$84.2k</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
              Maintain this pace to cross your quarterly target before the
              final month.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "78%" }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-emerald-400"
                />
              </div>
              <span className="text-sm font-semibold text-emerald-300">
                78%
              </span>
            </div>
          </div>
        </motion.section>
      </section>
    </div>
  );
}
