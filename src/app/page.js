"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  ScaleIn,
  TRANSITION_EASE,
} from "@/components/common/MotionWrapper";
import { fetchProducts } from "@/store/slices/productSlice";
import { fetchPublicBlogPosts } from "@/store/slices/blogSlice";
import { getCategories } from "@/store/slices/categorySlice";
import { getBrands } from "@/store/slices/brandSlice";
import {
  Flame,
  Clock,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  ArrowRight,
  Sparkles,
  Award,
  Tag,
  Laptop,
  Shirt,
  Watch,
  Footprints,
  Home as HomeIcon,
  Leaf,
} from "lucide-react";

// Top Category Quick Bar Items
const TOP_CATEGORIES = [
  { name: "All", icon: ShoppingBag, color: "bg-emerald-50 text-emerald-600" },
  { name: "Clothing", icon: Shirt, color: "bg-blue-50 text-blue-600" },
  { name: "Electronics", icon: Laptop, color: "bg-purple-50 text-purple-600" },
  { name: "Footwear", icon: Footprints, color: "bg-orange-50 text-orange-600" },
  { name: "Accessories", icon: Watch, color: "bg-amber-50 text-amber-600" },
  { name: "Home", icon: HomeIcon, color: "bg-teal-50 text-teal-600" },
  { name: "Sustainability", icon: Leaf, color: "bg-emerald-50 text-emerald-600" },
];

// Hero Banner Slides
const HERO_SLIDES = [
  {
    id: 1,
    title: "Summer Collection 2026",
    subtitle: "UP TO 40% OFF",
    description: "Breathable organic cotton, relaxed linen blends, and effortless daily essentials.",
    bgGradient: "from-emerald-900 via-slate-900 to-teal-950",
    badge: "Limited Season Drop",
    buttonText: "Shop Collection",
    buttonLink: "/product",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80",
  },
  {
    id: 2,
    title: "Next-Gen Audio & Tech",
    subtitle: "PREMIUM SOUND",
    description: "Active noise cancellation, 40-hour battery life, and crystal clear acoustics.",
    bgGradient: "from-slate-950 via-purple-950 to-indigo-950",
    badge: "Trending Electronics",
    buttonText: "Explore Gadgets",
    buttonLink: "/product?category=Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
  },
  {
    id: 3,
    title: "Crafted Footwear & Sneakers",
    subtitle: "ALL-DAY COMFORT",
    description: "Lightweight cushioned outsoles designed for high endurance and daily urban wear.",
    bgGradient: "from-amber-950 via-slate-900 to-stone-950",
    badge: "Top Rating 4.9★",
    buttonText: "Discover Footwear",
    buttonLink: "/product?category=Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
  },
];

export default function HomePage() {
  const dispatch = useDispatch();

  const { items: products, loading: productsLoading } = useSelector(
    (state) => state.products
  );
  const { posts: blogPosts } = useSelector((state) => state.blog);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // Live Flash Sale Countdown Timer (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchPublicBlogPosts({ limit: 3 }));
    dispatch(getCategories());
    dispatch(getBrands());
  }, [dispatch]);

  // Timer countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hero carousel auto-slide
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  // Filter products for Deals of the Day (on sale or price discount)
  const dealsProducts = products
    ? products.filter((p) => p.salePrice || p.regularPrice).slice(0, 6)
    : [];

  // Filter products for main tabs
  const filteredProducts = products
    ? products.filter((p) => {
        if (activeTab === "all") return true;
        if (activeTab === "bestsellers") return p.rating >= 4.8 || p.publish;
        if (activeTab === "new") return true;
        return p.category?.toLowerCase() === activeTab.toLowerCase();
      }).slice(0, 8)
    : [];

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col font-sans overflow-x-hidden">
      <Header />

      {/* 1. TOP CATEGORY NAV STRIP */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
            {TOP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.name === "All" ? "/product" : `/product?category=${encodeURIComponent(cat.name)}`}
                  className="shrink-0"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-2xl hover:bg-slate-50 transition group"
                  >
                    <div className={`w-10 h-10 rounded-2xl ${cat.color} flex items-center justify-center shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition whitespace-nowrap">
                      {cat.name}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-10">
        {/* 2. HERO PROMO SLIDER CAROUSEL */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 min-h-[380px] sm:min-h-[440px] flex items-center bg-slate-950">
          <AnimatePresence mode="wait">
            {HERO_SLIDES.map((slide, idx) => {
              if (idx !== currentSlide) return null;
              return (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: TRANSITION_EASE }}
                  className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} flex items-center z-10`}
                >
                  {/* Background Cover Image with overlay */}
                  <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-30 md:opacity-60 overflow-hidden">
                    <motion.img
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 6 }}
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
                  </div>

                  {/* Slide Content */}
                  <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-10 text-white space-y-4">
                    <motion.span
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 backdrop-blur-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {slide.badge}
                    </motion.span>

                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.45 }}
                      className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
                    >
                      {slide.title}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.45 }}
                      className="text-emerald-400 font-extrabold text-sm sm:text-base uppercase tracking-wider"
                    >
                      {slide.subtitle}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.45 }}
                      className="text-slate-300 text-xs sm:text-sm max-w-lg leading-relaxed"
                    >
                      {slide.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.45 }}
                      className="pt-2"
                    >
                      <Link
                        href={slide.buttonLink}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs sm:text-sm hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition transform active:scale-95"
                      >
                        {slide.buttonText}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Slider Controls */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-8 bg-emerald-400" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 3. DEALS OF THE DAY / FLASH SALE SECTION */}
        <FadeIn className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Deals of the Day
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold uppercase">
                    Flash Sale
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Limited time discounts on top-rated products.
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xs shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">Ends in:</span>
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, "0")}h</span>
                <span>:</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, "0")}m</span>
                <span>:</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, "0")}s</span>
              </div>
            </div>
          </div>

          {/* Deals Grid */}
          {productsLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading deals...
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {dealsProducts.map((product) => (
                <StaggerItem key={product._id || product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeIn>

        {/* 4. FEATURED CATEGORIES CARDS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Explore Collections
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Shop By Category
              </h2>
            </div>
            <Link
              href="/product"
              className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Clothing & Apparel",
                sub: "Organic Tees, Hoodies & Pants",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
                link: "/product?category=Clothing",
              },
              {
                title: "Electronics & Tech",
                sub: "Headphones & Smart Audio",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
                link: "/product?category=Electronics",
              },
              {
                title: "Footwear & Shoes",
                sub: "Sneakers, Boots & Comfort",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
                link: "/product?category=Footwear",
              },
              {
                title: "Accessories & Leather",
                sub: "Watches, Bags & Straps",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
                link: "/product?category=Accessories",
              },
            ].map((item, index) => (
              <StaggerItem key={index}>
                <Link
                  href={item.link}
                  className="group relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm aspect-[4/3] bg-slate-900 block hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-base font-bold group-hover:text-emerald-400 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                      {item.sub}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* 5. TRENDING / BESTSELLERS PRODUCT GRID WITH TABS */}
        <FadeIn className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Handpicked Favorites
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Trending Products
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto">
              {[
                { id: "all", label: "All Items" },
                { id: "bestsellers", label: "Top Rated" },
                { id: "Clothing", label: "Clothing" },
                { id: "Electronics", label: "Electronics" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-slate-900 font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabPill"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute inset-0 bg-white rounded-xl shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid with AnimatePresence on tab change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: TRANSITION_EASE }}
            >
              {productsLoading ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Loading items...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No products found in this tab.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </FadeIn>

        {/* 6. BRAND SPOTLIGHT BANNER */}
        <FadeIn className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              Verified Partners
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Top Global Brands
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md">
              Authentic products directly sourced from authorized brand distributors worldwide.
            </p>
          </div>

          {/* Brand Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Nike", "Adidas", "Sony", "Puma", "Zara", "IKEA"].map((brand) => (
              <Link
                key={brand}
                href={`/product?search=${encodeURIComponent(brand)}`}
              >
                <motion.span
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  className="inline-block px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition backdrop-blur-md"
                >
                  {brand}
                </motion.span>
              </Link>
            ))}
          </div>
        </FadeIn>

        {/* 7. JOURNAL & BLOG HIGHLIGHTS SECTION */}
        {blogPosts && blogPosts.length > 0 && (
          <FadeIn className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Behind The Scenes
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  From The Journal
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition"
              >
                Read All Articles <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <StaggerItem key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group bg-white border border-slate-200/80 shadow-sm rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col h-full"
                  >
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-2xl">
                          {post.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-2">
                          {post.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                        <span>{post.readTime || 5} min read</span>
                        <span className="font-semibold text-emerald-600 group-hover:underline">Read →</span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        )}

        {/* 8. VALUE PROPOSITION & TRUST BADGES STRIP */}
        <StaggerContainer className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggerItem className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Free Express Delivery
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                On all qualifying orders nationwide.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                30-Day Free Returns
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Hassle-free exchanges and instant refunds.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                100% Secure Payment
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Encrypted transactions via trusted gateways.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                24/7 Priority Support
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Dedicated support team ready to assist.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </main>

      <Footer />
    </div>
  );
}

