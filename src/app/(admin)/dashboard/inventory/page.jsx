"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchInventoryOverview,
  updateStock,
  bulkRestock,
  clearInventoryError,
  clearInventorySuccess,
} from "@/store/slices/inventorySlice";
import { useToast } from "@/context/ToastContext";
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Minus,
  Check,
  RotateCcw,
  History,
  Layers,
  Sparkles,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  X,
  ExternalLink,
} from "lucide-react";

export default function InventoryOverviewPage() {
  const dispatch = useDispatch();
  const toast = useToast();

  const {
    stats,
    items: products,
    pagination,
    loading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.inventory);

  // Filters and state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("stock_asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Inline editing state: { [productId]: { quantity: number, threshold: number, dirty: boolean } }
  const [inlineValues, setInlineValues] = useState({});

  // Selection for bulk restock
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAddQty, setBulkAddQty] = useState(10);
  const [bulkReason, setBulkReason] = useState("Batch Supplier Restock");

  // Single restock modal
  const [restockModalProduct, setRestockModalProduct] = useState(null);
  const [singleRestockQty, setSingleRestockQty] = useState(10);
  const [singleRestockReason, setSingleRestockReason] = useState("Supplier Restock");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch inventory whenever query params change
  useEffect(() => {
    dispatch(
      fetchInventoryOverview({
        search: debouncedSearch,
        stockStatus,
        category,
        sort,
        page: currentPage,
        limit: 10,
      })
    );
  }, [dispatch, debouncedSearch, stockStatus, category, sort, currentPage]);

  // Sync inline edit state when products update
  useEffect(() => {
    if (products && products.length > 0) {
      const initial = {};
      products.forEach((p) => {
        initial[p._id] = {
          quantity: p.quantity ?? 0,
          threshold: p.lowStockThreshold ?? 5,
          dirty: false,
        };
      });
      setInlineValues(initial);
    }
  }, [products]);

  // Handle toast notices
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearInventorySuccess());
      // Refresh inventory after action
      dispatch(
        fetchInventoryOverview({
          search: debouncedSearch,
          stockStatus,
          category,
          sort,
          page: currentPage,
          limit: 10,
        })
      );
    }
    if (error) {
      toast.error(typeof error === "string" ? error : "An error occurred");
      dispatch(clearInventoryError());
    }
  }, [successMessage, error, dispatch, debouncedSearch, stockStatus, category, sort, currentPage, toast]);

  // Inline quantity changes
  const handleInlineQtyChange = (productId, newQty) => {
    const val = Math.max(0, parseInt(newQty, 10) || 0);
    setInlineValues((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: val,
        dirty: true,
      },
    }));
  };

  const handleSaveInline = async (productId) => {
    const edit = inlineValues[productId];
    if (!edit) return;
    try {
      await dispatch(
        updateStock({
          productId,
          quantity: edit.quantity,
          lowStockThreshold: edit.threshold,
          reason: "Quick Inline Inventory Update",
          performedBy: "Admin",
        })
      ).unwrap();
      toast.success("Stock updated successfully");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update stock");
    }
  };

  // Selection helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit Single Restock
  const handleSingleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockModalProduct || singleRestockQty <= 0) return;

    try {
      await dispatch(
        updateStock({
          productId: restockModalProduct._id,
          adjustBy: singleRestockQty,
          reason: singleRestockReason || "Supplier Restock",
          performedBy: "Admin",
        })
      ).unwrap();
      setRestockModalProduct(null);
      setSingleRestockQty(10);
      toast.success(
        `Added +${singleRestockQty} units to ${restockModalProduct.name}`
      );
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to restock");
    }
  };

  // Submit Bulk Restock
  const handleBulkRestockSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0 || bulkAddQty <= 0) return;

    const items = selectedIds.map((id) => ({
      productId: id,
      addQuantity: bulkAddQty,
    }));

    try {
      await dispatch(
        bulkRestock({
          items,
          reason: bulkReason || "Batch Restock",
          performedBy: "Admin",
        })
      ).unwrap();
      setShowBulkModal(false);
      setSelectedIds([]);
      toast.success(`Successfully restocked ${items.length} products`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Bulk restock failed");
    }
  };

  // Unique categories for filter dropdown
  const categoriesList = Array.from(
    new Set((products || []).map((p) => p.category).filter(Boolean))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Real-time Warehouse & Stock Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor stock levels, handle rapid restocks, configure alerts, and audit inventory movements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/dashboard/inventory/logs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs"
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>Audit History & Logs</span>
          </Link>

          <button
            onClick={() =>
              dispatch(
                fetchInventoryOverview({
                  search: debouncedSearch,
                  stockStatus,
                  category,
                  sort,
                  page: currentPage,
                  limit: 10,
                })
              )
            }
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI METRICS ROW (Animated Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total SKUs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {stats?.totalProducts ?? 0}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Products</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>In Catalog</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200" />
        </motion.div>

        {/* Card 2: Total Units In Stock */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Units
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {stats?.totalUnitsInStock?.toLocaleString() ?? 0}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Units</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Available Warehouse Stock
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </motion.div>

        {/* Card 3: Low Stock Warning (Clickable Filter) */}
        <motion.button
          onClick={() => {
            setStockStatus(stockStatus === "low_stock" ? "all" : "low_stock");
            setCurrentPage(1);
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`text-left bg-white rounded-2xl p-5 border shadow-xs relative overflow-hidden group transition ${
            stockStatus === "low_stock"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20"
              : "border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 relative">
              <AlertTriangle className="w-4 h-4" />
              {stats?.lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">
              {stats?.lowStockCount ?? 0}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Items</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium flex items-center justify-between">
            <span>≤ Threshold</span>
            <span className="text-[10px] underline font-bold">Filter</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </motion.button>

        {/* Card 4: Out of Stock Alert (Clickable Filter) */}
        <motion.button
          onClick={() => {
            setStockStatus(stockStatus === "out_of_stock" ? "all" : "out_of_stock");
            setCurrentPage(1);
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`text-left bg-white rounded-2xl p-5 border shadow-xs relative overflow-hidden group transition ${
            stockStatus === "out_of_stock"
              ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20"
              : "border-slate-200/80 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">
              {stats?.outOfStockCount ?? 0}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Items</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium flex items-center justify-between">
            <span>0 Units Left</span>
            <span className="text-[10px] underline font-bold">Filter</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </motion.button>

        {/* Card 5: Inventory Valuation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stock Valuation
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 truncate">
              ₹{stats?.totalValuation?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-medium">
            Total Inventory Value
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </motion.div>
      </div>

      {/* FILTER & ACTION TOOLBAR */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            {[
              { key: "all", label: "All Items", count: stats?.totalProducts },
              { key: "in_stock", label: "In Stock", count: stats?.inStockCount },
              { key: "low_stock", label: "Low Stock", count: stats?.lowStockCount },
              { key: "out_of_stock", label: "Out of Stock", count: stats?.outOfStockCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStockStatus(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  stockStatus === tab.key
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                      stockStatus === tab.key
                        ? "bg-slate-100 text-slate-700"
                        : "bg-slate-200/70 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SECOND ROW: CATEGORY & SORT FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Category:</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="stock_asc">Stock: Low to High</option>
                <option value="stock_desc">Stock: High to Low</option>
                <option value="name_asc">Product Name (A-Z)</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Trigger Button */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200"
            >
              <span className="font-bold text-xs">
                {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bulk Restock</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* MAIN INVENTORY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 pl-6 pr-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      products.length > 0 &&
                      selectedIds.length === products.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-3 min-w-[240px]">Product & SKU</th>
                <th className="py-4 px-3">Category</th>
                <th className="py-4 px-3">Price & Valuation</th>
                <th className="py-4 px-3 min-w-[140px]">Stock Status</th>
                <th className="py-4 px-3 min-w-[180px]">Inventory Level</th>
                <th className="py-4 px-3 min-w-[180px]">Quick Adjust</th>
                <th className="py-4 pr-6 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-600" />
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Loading inventory items...
                    </p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-800">
                      No products match your criteria
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing filters or search query to view all items.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const pId = product._id;
                  const isSelected = selectedIds.includes(pId);
                  const edit = inlineValues[pId] || {
                    quantity: product.quantity,
                    threshold: product.lowStockThreshold || 5,
                    dirty: false,
                  };

                  const qty = Number(product.quantity) || 0;
                  const threshold = Number(product.lowStockThreshold) || 5;

                  // Stock bar visual ratio (normalized max 50 for gauge)
                  const barPercent = Math.min(100, Math.round((qty / Math.max(30, threshold * 3)) * 100));

                  const img =
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80";

                  return (
                    <tr
                      key={pId}
                      className={`hover:bg-slate-50/60 transition group ${
                        isSelected ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 pr-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(pId)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Product & SKU */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={product.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 bg-slate-50 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/product/${pId}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-emerald-600 transition line-clamp-1 flex items-center gap-1 group/link"
                            >
                              <span>{product.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover/link:opacity-100 transition" />
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                                SKU: {product.productSKU || product.productCode || pId.slice(-6).toUpperCase()}
                              </span>
                              {product.brand && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {product.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {product.category || "General"}
                        </span>
                      </td>

                      {/* Price & Valuation */}
                      <td className="py-4 px-3">
                        <div className="font-extrabold text-slate-900">
                          ₹{(product.effectivePrice || product.regularPrice || 0).toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Valuation: ₹{(product.valuation || 0).toFixed(2)}
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-3">
                        {product.stockStatus === "out_of_stock" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Out of Stock
                          </span>
                        ) : product.stockStatus === "low_stock" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Low Stock ({qty})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            In Stock ({qty})
                          </span>
                        )}
                      </td>

                      {/* Inventory Level Visual Meter */}
                      <td className="py-4 px-3">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-slate-700 font-bold">
                              {qty} units
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Alert ≤{threshold}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                qty === 0
                                  ? "bg-rose-500 w-0"
                                  : qty <= threshold
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.max(5, barPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Quick Inline Adjustment */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleInlineQtyChange(pId, edit.quantity - 1)
                              }
                              className="p-1 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition"
                              title="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={edit.quantity}
                              onChange={(e) =>
                                handleInlineQtyChange(pId, e.target.value)
                              }
                              className="w-12 text-center font-bold text-xs bg-transparent text-slate-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleInlineQtyChange(pId, edit.quantity + 1)
                              }
                              className="p-1 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition"
                              title="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {edit.dirty && (
                            <motion.button
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              onClick={() => handleSaveInline(pId)}
                              className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
                              title="Save Stock"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setRestockModalProduct(product);
                              setSingleRestockQty(10);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition border border-emerald-200/80 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>

                          <Link
                            href={`/dashboard/inventory/logs?productId=${pId}`}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="View Audit Trail"
                          >
                            <History className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing{" "}
              <span className="font-bold text-slate-800">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}
              </span>{" "}
              of <span className="font-bold text-slate-800">{pagination.total}</span> items
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SINGLE PRODUCT RESTOCK MODAL */}
      <AnimatePresence>
        {restockModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-6 relative"
            >
              <button
                onClick={() => setRestockModalProduct(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Package className="w-4 h-4" />
                  <span>Receive Shipment / Restock</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Restock Inventory
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {restockModalProduct.name}
                </p>
              </div>

              {/* Current stock status info box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Current Stock</span>
                  <span className="text-lg font-black text-slate-900">
                    {restockModalProduct.quantity} units
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium block">New Total</span>
                  <span className="text-lg font-black text-emerald-600">
                    {restockModalProduct.quantity + (parseInt(singleRestockQty, 10) || 0)} units
                  </span>
                </div>
              </div>

              {/* Quick Add presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Quick Add:</span>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSingleRestockQty(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        singleRestockQty === num
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Quantity Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Add Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={singleRestockQty}
                  onChange={(e) => setSingleRestockQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Audit Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Audit Reason / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-84920 Supplier shipment"
                  value={singleRestockReason}
                  onChange={(e) => setSingleRestockReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalProduct(null)}
                  className="py-3 px-4 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSingleRestockSubmit}
                  disabled={actionLoading}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Restock</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK RESTOCK MODAL */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-6 relative"
            >
              <button
                onClick={() => setShowBulkModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Boxes className="w-4 h-4" />
                  <span>Batch Operation</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Bulk Restock Products
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Restocking{" "}
                  <span className="font-bold text-emerald-600">
                    {selectedIds.length}
                  </span>{" "}
                  selected products at once.
                </p>
              </div>

              {/* Quick presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Add Units to Each:</span>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBulkAddQty(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        bulkAddQty === num
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      +{num} each
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Quantity per Item
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkAddQty}
                  onChange={(e) => setBulkAddQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Batch Reason / Audit Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Warehouse Inbound"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="py-3 px-4 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkRestockSubmit}
                  disabled={actionLoading}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Execute Bulk Restock</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
