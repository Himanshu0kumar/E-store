"use client";

import { useState, useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { fetchInventoryLogs } from "@/store/slices/inventorySlice";
import {
  History,
  ArrowLeft,
  Filter,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  ShoppingCart,
  Sliders,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

function InventoryLogsContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get("productId") || "";

  const { logs, logsPagination, logsLoading } = useSelector(
    (state) => state.inventory
  );

  const [productId, setProductId] = useState(initialProductId);
  const [changeType, setChangeType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchInventoryLogs({
        productId: productId || undefined,
        changeType,
        page: currentPage,
        limit: 20,
      })
    );
  }, [dispatch, productId, changeType, currentPage]);

  const getEventBadge = (type, qty) => {
    switch (type) {
      case "restock":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            Restocked (+{qty})
          </span>
        );
      case "order_deducted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
            <ShoppingCart className="w-3.5 h-3.5 text-sky-600" />
            Order Deducted ({qty})
          </span>
        );
      case "order_cancelled_restock":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            Cancelled Restock (+{qty})
          </span>
        );
      case "return_restock":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            Return Restock (+{qty})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            Manual Adjust ({qty > 0 ? `+${qty}` : qty})
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/inventory"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stock Overview</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-emerald-600" />
            <span>Inventory Audit Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete historical audit trail of all warehouse stock movements, checkout deductions, and restocks.
          </p>
        </div>

        <button
          onClick={() =>
            dispatch(
              fetchInventoryLogs({
                productId: productId || undefined,
                changeType,
                page: currentPage,
                limit: 20,
              })
            )
          }
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs self-start sm:self-auto flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw
            className={`w-4 h-4 ${logsLoading ? "animate-spin text-emerald-600" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-2xl">
          {[
            { key: "all", label: "All Movements" },
            { key: "restock", label: "Restocks" },
            { key: "order_deducted", label: "Order Deductions" },
            { key: "order_cancelled_restock", label: "Cancellation Restocks" },
            { key: "manual_adjustment", label: "Manual Adjustments" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setChangeType(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                changeType === tab.key
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {productId && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-200">
            <span>Filtered by product</span>
            <button
              onClick={() => {
                setProductId("");
                setCurrentPage(1);
              }}
              className="text-emerald-600 hover:text-emerald-900 underline ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 pl-6 pr-3">Timestamp</th>
                <th className="py-4 px-3 min-w-[220px]">Product & SKU</th>
                <th className="py-4 px-3">Event Type</th>
                <th className="py-4 px-3">Stock Transition</th>
                <th className="py-4 px-3 min-w-[200px]">Reason / Reference</th>
                <th className="py-4 pr-6 pl-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {logsLoading && logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-600" />
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Loading audit records...
                    </p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-800">
                      No stock movement logs found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Stock adjustments, purchases, and restocks will record an audit trail here.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const product = log.product || {};
                  const img =
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : null;

                  const dateFormatted = new Date(log.createdAt).toLocaleString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Timestamp */}
                      <td className="py-4 pl-6 pr-3 whitespace-nowrap text-slate-500 font-medium text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img
                              src={img}
                              alt={log.productName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 line-clamp-1 block">
                              {log.productName}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                              SKU: {log.productSKU || (log.product?._id || "").slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Event Type Badge */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {getEventBadge(log.changeType, log.quantityChange)}
                      </td>

                      {/* Stock Transition */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-mono font-bold">
                          <span className="text-slate-500">
                            {log.previousStock}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span
                            className={
                              log.newStock > log.previousStock
                                ? "text-emerald-700"
                                : log.newStock < log.previousStock
                                ? "text-sky-700"
                                : "text-slate-800"
                            }
                          >
                            {log.newStock}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-extrabold ${
                              log.quantityChange > 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {log.quantityChange > 0
                              ? `+${log.quantityChange}`
                              : log.quantityChange}
                          </span>
                        </div>
                      </td>

                      {/* Reason / Reference */}
                      <td className="py-4 px-3">
                        <div className="text-slate-700 font-medium">
                          {log.reason || "Inventory adjustment"}
                        </div>
                        {log.referenceOrderNumber && (
                          <span className="text-[11px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 mt-0.5">
                            <span>Order #{log.referenceOrderNumber}</span>
                          </span>
                        )}
                      </td>

                      {/* Operator */}
                      <td className="py-4 pr-6 pl-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg text-[11px]">
                          <User className="w-3 h-3 text-slate-400" />
                          {log.performedBy || "System"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {logsPagination && logsPagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page{" "}
              <span className="font-bold text-slate-800">
                {logsPagination.page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {logsPagination.totalPages}
              </span>{" "}
              ({logsPagination.total} total audit records)
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= logsPagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(logsPagination.totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-600" />
          <p className="mt-2 text-xs font-semibold text-slate-400">
            Loading logs...
          </p>
        </div>
      }
    >
      <InventoryLogsContent />
    </Suspense>
  );
}
