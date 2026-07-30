"use client";

import { Truck, ShieldCheck, Leaf, Heart } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const STATS = [
  { value: "150K+", label: "Happy Customers" },
  { value: "12", label: "Years in Business" },
  { value: "40+", label: "Countries Shipped To" },
  { value: "4.8/5", label: "Average Rating" },
];

const VALUES = [
  {
    icon: Leaf,
    title: "Sustainably Made",
    description:
      "We work with manufacturers who prioritize responsible materials and ethical labor practices.",
  },
  {
    icon: ShieldCheck,
    title: "Built to Last",
    description:
      "Every product is tested for durability — we'd rather sell you one great thing than three mediocre ones.",
  },
  {
    icon: Truck,
    title: "Fast, Honest Shipping",
    description:
      "Real delivery estimates, tracked from our warehouse to your door, no surprises.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description:
      "If something's wrong, we make it right — real people answer our support inbox, not a bot.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      {/* Hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            Our Story
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight max-w-2xl mx-auto">
            Good products, made honestly, sold simply
          </h1>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto">
            We started as a two-person team frustrated by low-quality goods
            dressed up in good marketing. Today we're still small enough to
            care about every order.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="max-w-5xl mx-auto px-4 pb-12 w-full">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
              Why we exist
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Every product on this site is something we'd genuinely use
              ourselves. We test samples for months before they make it to
              the catalog, and we cut anything that doesn't hold up.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              No dropshipping, no unnamed factories — we know exactly where
              everything comes from, and we're happy to tell you if you ask.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100">
            <img
              src="https://picsum.photos/seed/about-team/800/450"
              alt="Our team at work"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-5xl mx-auto px-4 pb-16 w-full flex-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center mb-8">
          What we care about
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold mb-1">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Ready to see for yourself?
          </h2>
          <p className="text-slate-500 mb-6">
            Browse the catalog — no account required to look around.
          </p>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Shop All Products
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}