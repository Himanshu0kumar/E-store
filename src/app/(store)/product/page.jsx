"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/store/slices/productSlice";
import { Search, SlidersHorizontal, X, PackageSearch, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/common/Pagination";
import ProductCard from "@/components/common/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const COLOR_HEX_MAP = {
  black: "#0F172A",
  white: "#F8FAFC",
  red: "#E11D48",
  rose: "#E11D48",
  blue: "#2563EB",
  emerald: "#059669",
  green: "#059669",
  amber: "#D97706",
  yellow: "#EAB308",
  purple: "#9333EA",
  gray: "#64748B",
  slate: "#475569",
};

const DEFAULT_COLOR_OPTIONS = [
  { name: "Black", hex: "#0F172A" },
  { name: "White", hex: "#F8FAFC" },
  { name: "Emerald", hex: "#059669" },
  { name: "Rose", hex: "#E11D48" },
  { name: "Amber", hex: "#D97706" },
  { name: "Blue", hex: "#2563EB" },
];

const DEFAULT_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const PAGE_SIZE = 9;

function ProductsContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const searchUrlParam = searchParams.get("search");

  const { items: dbProducts, loading } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState(searchUrlParam || "");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (searchUrlParam !== null) {
      setSearchTerm(searchUrlParam);
    }
  }, [searchUrlParam]);

  // Transform and normalize products strictly from DB state
  const allProducts = useMemo(() => {
    if (!Array.isArray(dbProducts)) return [];

    return dbProducts.map((p) => {
      const id = p._id || p.id;
      const name = p.name || "Untitled Product";
      const category = p.category || "General";

      const rawPrice =
        typeof p.price === "number"
          ? p.price
          : Number(p.salePrice ?? p.regularPrice ?? p.priceRange?.min) || 0;
      const price = isNaN(rawPrice) ? 0 : rawPrice;

      const rawOriginal =
        typeof p.originalPrice === "number"
          ? p.originalPrice
          : (p.salePrice && p.regularPrice > p.salePrice ? Number(p.regularPrice) : null);
      const originalPrice = rawOriginal && !isNaN(rawOriginal) && rawOriginal > price ? rawOriginal : null;

      let discountPercent = Number(p.discountPercent) || 0;
      if (!discountPercent && originalPrice && price < originalPrice) {
        discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
      }

      // Extract sizes
      let sizes = Array.isArray(p.sizes) ? p.sizes : [];
      if (sizes.length === 0 && Array.isArray(p.attributes)) {
        const sizeAttr = p.attributes.find((a) => a?.name && a.name.toLowerCase() === "size");
        if (sizeAttr && Array.isArray(sizeAttr.values)) {
          sizes = sizeAttr.values;
        }
      }

      // Extract colors
      let colors = Array.isArray(p.colors) ? p.colors : [];
      if (colors.length === 0 && Array.isArray(p.attributes)) {
        const colorAttr = p.attributes.find((a) => a?.name && a.name.toLowerCase() === "color");
        if (colorAttr && Array.isArray(colorAttr.values)) {
          colors = colorAttr.values.map((val) => ({
            name: val,
            hex: typeof val === "string" ? (COLOR_HEX_MAP[val.toLowerCase()] || "#94A3B8") : "#94A3B8",
          }));
        }
      }

      const rating = typeof p.rating === "number" && p.rating > 0 ? p.rating : 4.5;
      const reviewCount = typeof p.reviewCount === "number" ? p.reviewCount : 12;
      const soldCount = typeof p.soldCount === "number" ? p.soldCount : 0;
      const daysAgoAdded = p.createdAt
        ? Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const image =
        p.image ||
        (Array.isArray(p.images) && p.images.length > 0
          ? p.images[0]
          : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80");

      return {
        ...p,
        id,
        _id: id,
        name,
        category,
        price,
        originalPrice,
        discountPercent,
        rating,
        reviewCount,
        soldCount,
        daysAgoAdded,
        image,
        sizes,
        colors,
      };
    });
  }, [dbProducts]);

  // Extract dynamic categories from real DB products
  const availableCategories = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    const list = Array.from(set);
    return list.length > 0 ? list : ["Clothing", "Footwear", "Accessories", "Electronics", "Home"];
  }, [allProducts]);

  // Extract dynamic sizes from real DB products
  const availableSizes = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      if (Array.isArray(p.sizes)) {
        p.sizes.forEach((s) => set.add(s));
      }
    });
    const list = Array.from(set);
    return list.length > 0 ? list : DEFAULT_SIZE_OPTIONS;
  }, [allProducts]);

  // Extract dynamic colors from real DB products
  const availableColors = useMemo(() => {
    const map = new Map();
    allProducts.forEach((p) => {
      if (Array.isArray(p.colors)) {
        p.colors.forEach((c) => {
          const name = typeof c === "string" ? c : c.name;
          const hex = typeof c === "string" ? (COLOR_HEX_MAP[c.toLowerCase()] || "#94A3B8") : (c.hex || "#94A3B8");
          if (name) map.set(name, hex);
        });
      }
    });
    const list = Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
    return list.length > 0 ? list : DEFAULT_COLOR_OPTIONS;
  }, [allProducts]);

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

  // Filtering + search
  const filteredProducts = useMemo(() => {
    const results = allProducts.filter((product) => {
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
        product.colors.some((color) => {
          const colorName = typeof color === "string" ? color : color.name;
          return selectedColors.includes(colorName);
        });

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
        // "featured"
        break;
    }
    return sorted;
  }, [allProducts, searchTerm, selectedCategories, selectedSizes, selectedColors, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const FilterPanel = (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Category</h3>
        <div className="space-y-2">
          {availableCategories.map((category) => (
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

      {/* Size Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
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

      {/* Color Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Color</h3>
        <div className="flex flex-wrap gap-3">
          {availableColors.map((color) => {
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

      {/* Page header banner */}
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

      {/* Toolbar: Search + Mobile Filter Toggle + Sorting */}
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
            {/* Mobile filter button */}
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

            {/* Sort Select */}
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
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sticky top-32">
              <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                Filters
              </h2>
              {FilterPanel}
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
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

          {/* Product Grid Area */}
          <div className="lg:col-span-4">
            {loading ? (
              /* Industry Standard Skeleton Loaders */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse flex flex-col justify-between h-[380px]"
                  >
                    <div>
                      <div className="aspect-square bg-slate-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-slate-200 rounded w-1/4" />
                        <div className="h-5 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="h-10 bg-slate-200 rounded-xl w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
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
                  {hasActiveFilters
                    ? "No products match your filters"
                    : "No products available"}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your search terms or clearing filters"
                    : "Products added via the admin panel will appear here automatically."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
          <div className="text-slate-500 text-sm">Loading products...</div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}