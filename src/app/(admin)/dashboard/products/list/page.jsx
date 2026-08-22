"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts, deleteProduct } from "@/store/slices/productSlice";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import {
  Search,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ProductsListPage() {
  const dispatch = useDispatch();
  const { items: allProducts, loading, deleteStatus } = useSelector(
    (state) => state.products,
  );

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // "all", "in-stock", "low-stock", "out-of-stock"
  const [publishFilter, setPublishFilter] = useState("all"); // "all", "published", "draft"
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const itemsPerPage = 10;

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filter and search logic
  useEffect(() => {
    let result = allProducts;

    // Search filter
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Stock filter
    if (stockFilter === "out-of-stock") {
      result = result.filter((p) => p.quantity === 0);
    } else if (stockFilter === "low-stock") {
      result = result.filter((p) => p.quantity > 0 && p.quantity <= 10);
    } else if (stockFilter === "in-stock") {
      result = result.filter((p) => p.quantity > 10);
    }

    // Publish filter
    if (publishFilter === "published") {
      result = result.filter((p) => p.publish === true);
    } else if (publishFilter === "draft") {
      result = result.filter((p) => p.publish === false);
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allProducts, searchQuery, stockFilter, publishFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      await dispatch(deleteProduct(selectedProduct._id));
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  const ActionMenu = ({ product }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="relative inline-block" ref={menuRef}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <MoreVertical className="h-5 w-5" />
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            >
              <Link
                href={`/dashboard/products/${product._id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>

              <Link
                href={`/dashboard/products/${product._id}/edit`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>

              <button
                onClick={() => {
                  setOpen(false);
                  handleDeleteClick(product);
                }}
                disabled={deleteStatus === "loading"}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const getStockBadge = (quantity) => {
    if (quantity === 0) {
      return (
        <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          out of stock
        </span>
      );
    } else if (quantity <= 10) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-yellow-100">
            <div
              className="h-full rounded-full bg-yellow-500"
              style={{ width: `${(quantity / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-yellow-700">
            {quantity} low stock
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-emerald-100">
            <div className="h-full rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-medium text-emerald-700">
            {quantity} in stock
          </span>
        </div>
      );
    }
  };

  const getPublishBadge = (publish) => {
    if (publish) {
      return (
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          Published
        </span>
      );
    } else {
      return (
        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Draft
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* PAGE HEADER */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">List</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
              <span className="text-slate-600">Dashboard</span>
              <span>•</span>
              <span className="text-slate-600">Product</span>
              <span>•</span>
              <span>List</span>
            </div>
          </div>

          <Link
            href="/dashboard/products/add"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <span>+</span>
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {/* FILTERS & SEARCH */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Stock Filter */}
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronDown size={18} />
            </span>
          </div>

          {/* Publish Filter */}
          <div className="relative">
            <select
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Publish</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronDown size={18} />
            </span>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search />
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
              Columns
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
              Filters
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
              Export
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
              Settings
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="max-h-[650px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-slate-300 accent-emerald-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600">
                    Create at
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600">
                    Publish
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className="text-sm text-slate-400">
                        Loading products...
                      </p>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className="text-sm text-slate-400">
                        No products found
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border border-slate-300 accent-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-200" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {product.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          <p>
                            {new Date(product.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(product.createdAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStockBadge(product.quantity)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">
                          ₹{Number(product.regularPrice).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getPublishBadge(product.publish)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ActionMenu product={product} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {paginatedProducts.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Rows per page:{" "}
              <select className="rounded border border-slate-200 px-2 py-1 text-sm">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span className="ml-4">
                {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}{" "}
                of {filteredProducts.length}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete product?"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedProduct(null);
        }}
        isLoading={deleteStatus === "loading"}
      />
    </div>
  );
}