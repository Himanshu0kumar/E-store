"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Trash2,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader,
  RefreshCw,
  MoreVertical,
  X,
  AlertCircle,
} from "lucide-react";
import {
  fetchAdminOrders,
  fetchOrderStatsAction,
  updateOrderStatusAction,
  deleteOrderAction,
} from "@/store/slices/orderSlice";
import InvoiceModal from "@/components/orders/InvoiceModal";

export default function AdminOrdersPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    adminOrders = [],
    stats = {},
    pagination = { page: 1, totalPages: 1, total: 0 },
    loading = false,
    actionLoading = false,
  } = useSelector((state) => state.orders || {});

  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [quickStatusModalOrder, setQuickStatusModalOrder] = useState(null);
  const [quickStatus, setQuickStatus] = useState("confirmed");

  // Fetch orders and KPI stats on mount and whenever filters change
  useEffect(() => {
    dispatch(fetchOrderStatsAction());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAdminOrders({
        status: activeStatusTab,
        paymentStatus: paymentStatusFilter,
        search: searchQuery,
        page,
        limit: 10,
      })
    );
  }, [dispatch, activeStatusTab, paymentStatusFilter, searchQuery, page]);

  const handleRefresh = () => {
    dispatch(fetchOrderStatsAction());
    dispatch(
      fetchAdminOrders({
        status: activeStatusTab,
        paymentStatus: paymentStatusFilter,
        search: searchQuery,
        page,
        limit: 10,
      })
    );
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(
        updateOrderStatusAction({
          orderId,
          data: { status: newStatus },
        })
      ).unwrap();
      setQuickStatusModalOrder(null);
      dispatch(fetchOrderStatsAction());
    } catch (err) {
      alert(err || "Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to permanently delete this order?")) {
      try {
        await dispatch(deleteOrderAction(orderId)).unwrap();
        dispatch(fetchOrderStatsAction());
      } catch (err) {
        alert(err || "Failed to delete order");
      }
    }
  };

  const statusColorMap = {
    placed: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-sky-50 text-sky-700 border-sky-200",
    processing: "bg-purple-50 text-purple-700 border-purple-200",
    shipped: "bg-blue-50 text-blue-700 border-blue-200",
    out_for_delivery: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    returned: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const paymentBadgeMap = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
    refunded: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor, fulfill, track and manage customer orders across all channels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            label: "Total Orders",
            value: stats.totalOrders ?? 0,
            icon: ShoppingBag,
            color: "text-slate-600",
            bg: "bg-white",
            border: "border-slate-200",
          },
          {
            label: "Pending",
            value: stats.pendingOrders ?? 0,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-white",
            border: "border-slate-200",
          },
          {
            label: "In-Transit",
            value: stats.inTransitOrders ?? 0,
            icon: Truck,
            color: "text-blue-600",
            bg: "bg-white",
            border: "border-slate-200",
          },
          {
            label: "Delivered",
            value: stats.deliveredOrders ?? 0,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-white",
            border: "border-slate-200",
          },
          {
            label: "Cancelled",
            value: stats.cancelledOrders ?? 0,
            icon: AlertCircle,
            color: "text-rose-600",
            bg: "bg-white",
            border: "border-slate-200",
          },
          {
            label: "Revenue",
            value: `₹${(stats.totalRevenue ?? 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-emerald-800 font-mono",
            bg: "bg-emerald-50/70",
            border: "border-emerald-200",
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              className={`${card.bg} border ${card.border} shadow-sm rounded-2xl p-4 transition-shadow hover:shadow-md`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`text-2xl font-bold mt-2 tabular-nums ${card.color}`}>
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Filter & Search Bar Container */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>

          {/* Payment Status Dropdown Filter */}
          <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Payment:
            </span>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:border-emerald-500 outline-none transition"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending (COD)</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
          {[
            { id: "all", label: "All Orders" },
            { id: "placed", label: "New Placed" },
            { id: "confirmed", label: "Confirmed" },
            { id: "processing", label: "Processing / Packed" },
            { id: "shipped", label: "Shipped" },
            { id: "out_for_delivery", label: "Out for Delivery" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveStatusTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeStatusTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Fetching orders...</p>
          </div>
        ) : adminOrders.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No customer orders match your query. Try resetting filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-bold">Order ID</th>
                  <th className="py-3.5 px-4 font-bold">Customer</th>
                  <th className="py-3.5 px-4 font-bold">Items</th>
                  <th className="py-3.5 px-4 font-bold">Amount</th>
                  <th className="py-3.5 px-4 font-bold">Payment</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminOrders.map((order, orderIdx) => {
                  const formattedDate = new Date(order.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(orderIdx * 0.04, 0.3) }}
                      className="hover:bg-slate-50/75 transition-colors group"
                    >
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="font-mono font-bold text-slate-900 hover:text-emerald-600 transition"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">{formattedDate}</p>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          {order.user?.name || order.customer?.name || "Customer"}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          {order.user?.email || order.customer?.email}
                        </p>
                        {(order.user?.phone || order.customer?.phone) && (
                          <p className="text-slate-400 text-[10px] font-mono">
                            {order.user?.phone || order.customer?.phone}
                          </p>
                        )}
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image || "/placeholder.jpg"}
                                alt={item.name}
                                className="inline-block h-7 w-7 rounded-lg object-cover ring-2 ring-white bg-slate-100"
                              />
                            ))}
                          </div>
                          <span className="text-slate-700 font-medium text-[11px]">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        ₹{order.pricing?.totalAmount?.toFixed(2)}
                      </td>

                      {/* Payment Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            paymentBadgeMap[order.paymentInfo?.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {order.paymentInfo?.status || "pending"}
                        </span>
                        <p className="text-[10px] text-slate-400 uppercase mt-0.5">
                          {order.paymentInfo?.method || "online"}
                        </p>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickStatusModalOrder(order);
                            setQuickStatus(order.orderStatus);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border hover:opacity-80 transition cursor-pointer ${
                            statusColorMap[order.orderStatus] ||
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {order.orderStatus?.replace("_", " ")}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage Details Link */}
                          <Link
                            href={`/dashboard/orders/${order._id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition"
                            title="Manage Order"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Invoice View Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition"
                            title="View Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Order Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs">
            <span className="text-slate-500 font-medium">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Status Change Modal */}
      <AnimatePresence>
        {quickStatusModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  Update Order Status
                </h3>
                <button
                  type="button"
                  onClick={() => setQuickStatusModalOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Order: <strong className="text-slate-800">#{quickStatusModalOrder.orderNumber}</strong>
              </p>

              <select
                value={quickStatus}
                onChange={(e) => setQuickStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:border-emerald-500 outline-none transition mb-4"
              >
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing & Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickStatusModalOrder(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(quickStatusModalOrder._id, quickStatus)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
                >
                  Save Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </div>
  );
}
