"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, PackageSearch, ChevronDown } from "lucide-react";
import Pagination from "@/components/common/Pagination";
import ProductCard from "@/components/common/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ----------------------------------------------------------------
// Mock catalog. Swap this out for a real API call (e.g. a
// useEffect + fetch, or a server component fetch upstream) — the
// filtering/search/sort/pagination logic below only cares that
// PRODUCTS is an array shaped like this.
// ----------------------------------------------------------------
const CATEGORIES = ["Clothing", "Footwear", "Accessories", "Electronics", "Home"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#0F172A" },
  { name: "White", hex: "#F8FAFC" },
  { name: "Emerald", hex: "#059669" },
  { name: "Rose", hex: "#E11D48" },
  { name: "Amber", hex: "#D97706" },
  { name: "Blue", hex: "#2563EB" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const PRODUCT_NAMES = [
  "Classic Crewneck Tee", "Tailored Chino Trousers", "Merino Wool Sweater",
  "Everyday Sneakers", "Trail Running Shoes", "Leather Ankle Boots",
  "Canvas Tote Bag", "Minimalist Watch", "Polarized Sunglasses",
  "Noise-Cancelling Headphones", "Portable Bluetooth Speaker", "USB-C Fast Charger",
  "Ceramic Table Lamp", "Linen Throw Pillow", "Woven Storage Basket",
  "Slim Fit Denim Jacket", "Relaxed Cotton Hoodie", "Pleated Midi Skirt",
  "Suede Chelsea Boots", "Performance Running Socks", "Structured Backpack",
  "Stainless Steel Water Bottle", "Wireless Charging Pad", "Smart Fitness Band",
];

const PRODUCTS = PRODUCT_NAMES.map((name, i) => {
  const category = CATEGORIES[i % CATEGORIES.length];
  const price = 24.99 + ((i * 13) % 180);
  const hasDiscount = i % 3 === 0;
  const discountPercent = hasDiscount ? 10 + ((i * 7) % 30) : 0;
  const originalPrice = hasDiscount ? price / (1 - discountPercent / 100) : price;

  return {
    id: i + 1,
    name,
    category,
    price,
    originalPrice,
    discountPercent,
    rating: 3.5 + ((i * 3) % 15) / 10,
    reviewCount: 12 + ((i * 37) % 480),
    soldCount: 5 + ((i * 53) % 900),
    daysAgoAdded: (i * 11) % 120, // lower = newer
    isNew: ((i * 11) % 120) < 14,
    image: `https://picsum.photos/seed/product-${i + 1}/600/600`,
    sizes: category === "Clothing" || category === "Footwear"
      ? SIZES.slice(i % 2, i % 2 + 4)
      : [],
    colors: [COLORS[i % COLORS.length], COLORS[(i + 2) % COLORS.length]],
  };
});

const PAGE_SIZE = 9;

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleValue = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || selectedCategories.length || selectedSizes.length || selectedColors.length;

  // Filtering + search, recomputed only when an input changes.
  const filteredProducts = useMemo(() => {
    const results = PRODUCTS.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);

      const matchesSize =
        selectedSizes.length === 0 ||
        product.sizes.some((size) => selectedSizes.includes(size));

      const matchesColor =
        selectedColors.length === 0 ||
        product.colors.some((color) => selectedColors.includes(color.name));

      return matchesSearch && matchesCategory && matchesSize && matchesColor;
    });

    const sorted = [...results];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort((a, b) => a.daysAgoAdded - b.daysAgoAdded);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "best-selling":
        sorted.sort((a, b) => b.soldCount - a.soldCount);
        break;
      default:
        // "featured" — keep catalog order
        break;
    }
    return sorted;
  }, [searchTerm, selectedCategories, selectedSizes, selectedColors, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const FilterPanel = (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() =>
                  toggleValue(selectedCategories, setSelectedCategories, category)
                }
                className="w-4 h-4 rounded accent-emerald-600"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      {/* Size */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isActive = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleValue(selectedSizes, setSelectedSizes, size)}
                className={`w-10 h-10 rounded-lg text-sm font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      {/* Color */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Color</h3>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => {
            const isActive = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => toggleValue(selectedColors, setSelectedColors, color.name)}
                title={color.name}
                aria-label={color.name}
                aria-pressed={isActive}
                className={`w-8 h-8 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive ? "border-emerald-600 scale-110" : "border-slate-200"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="w-4 h-4" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      {/* Page title */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            Catalog
          </p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Shop All Products
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
          </p>
        </div>
      </div>

      {/* Search + Sort toolbar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Sort products"
                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sticky top-32">
              <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                Filters
              </h2>
              {FilterPanel}
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-slate-900/40"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white p-5 overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Close filters"
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                {FilterPanel}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full mt-6 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Show {filteredProducts.length} results
                </button>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="lg:col-span-4">
            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="mt-10">
                  <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                  <PackageSearch className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  No products match your filters
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Try adjusting your search or clearing filters
                </p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}