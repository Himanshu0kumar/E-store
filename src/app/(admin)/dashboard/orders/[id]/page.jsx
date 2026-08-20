"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  User,
  MapPin,
  CreditCard,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader,
  Clock,
  ExternalLink,
  Package,
} from "lucide-react";
import {
  fetchOrderById,
  updateOrderStatusAction,
  cancelOrderAction,
} from "@/store/slices/orderSlice";
import OrderTracker from "@/components/orders/OrderTracker";
import InvoiceModal from "@/components/orders/InvoiceModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const orderId = params?.id;

  const { selectedOrder: order, detailLoading: loading } = useSelector(
    (state) => state.orders || {}
  );

  const [statusForm, setStatusForm] = useState({
    status: "placed",
    partner: "Ekart Logistics",
    trackingNumber: "",
    location: "",
    description: "",
    paymentStatus: "pending",
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [orderId, dispatch]);

  useEffect(() => {
    if (order) {
      setStatusForm({
        status: order.orderStatus || "placed",
        partner: order.courierInfo?.partner || "Ekart Logistics",
        trackingNumber: order.courierInfo?.trackingNumber || "",
        location: order.shippingAddress?.city || "",
        description: "",
        paymentStatus: order.paymentInfo?.status || "pending",
        notes: order.notes || "",
      });
    }
  }, [order]);

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await dispatch(
        updateOrderStatusAction({
          orderId: order._id,
          data: {
            status: statusForm.status,
            courierInfo: {
              partner: statusForm.partner,
              trackingNumber: statusForm.trackingNumber,
            },
            location: statusForm.location,
            description: statusForm.description,
            paymentStatus: statusForm.paymentStatus,
            notes: statusForm.notes,
          },
        })
      ).unwrap();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      dispatch(fetchOrderById(orderId));
    } catch (err) {
      alert(err || "Failed to update order status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmCancel = async (reason) => {
    try {
      await dispatch(
        cancelOrderAction({
          orderId: order._id,
          reason,
        })
      ).unwrap();
      setShowCancelModal(false);
      dispatch(fetchOrderById(orderId));
    } catch (err) {
      alert(err || "Failed to cancel order");
    }
  };

  if (loading || !order) {
    return (
      <div className="py-24 text-center">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
                #{order.orderNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  order.orderStatus === "delivered"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : order.orderStatus === "cancelled"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {order.orderStatus?.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Placed on {formattedDate}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Tax Invoice
          </button>

          {order.orderStatus !== "cancelled" && order.orderStatus !== "delivered" && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Order status and logistics details have been updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Visual Tracker Card */}
      <OrderTracker order={order} />

      {/* Main Grid: Status Updater & Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Items Table */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Order Items ({order.items.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Product</th>
                    <th className="py-2.5 font-bold text-center">Qty</th>
                    <th className="py-2.5 font-bold text-right">Price</th>
                    <th className="py-2.5 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => {
                    const variantDetails = [item.selectedColor, item.selectedSize]
                      .filter(Boolean)
                      .join(" / ");

                    return (
                      <tr key={item._id || idx}>
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-sm">
                              {item.name}
                            </p>
                            {variantDetails && (
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                Variant: {variantDetails}
                              </p>
                            )}
                            {item.sku && (
                              <p className="text-slate-400 text-[10px] font-mono">
                                SKU: {item.sku}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-center font-semibold text-slate-800">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-slate-600">
                          ${(item.price || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900 font-mono">
                          ${((item.price || 0) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Price Breakdown Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">
                    ${(order.pricing?.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-${(order.pricing?.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping:</span>
                  <span className="font-semibold text-slate-800">
                    {order.pricing?.shippingFee === 0
                      ? "Free"
                      : `$${(order.pricing?.shippingFee || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (8%):</span>
                  <span className="font-semibold text-slate-800">
                    ${(order.pricing?.tax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-emerald-700 font-extrabold font-mono">
                    ${(order.pricing?.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Information Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" /> Customer Details
              </h4>
              <p className="font-bold text-slate-900 text-sm">
                {order.user?.name || order.customer?.name || "Customer"}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {order.user?.email || order.customer?.email}
              </p>
              {(order.user?.phone || order.customer?.phone) && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Phone: {order.user?.phone || order.customer?.phone}
                </p>
              )}
            </div>

            {/* Delivery Address Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-600" /> Delivery Address
              </h4>
              <p className="font-bold text-slate-900 text-sm">
                {order.shippingAddress?.fullName}
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {order.shippingAddress?.street}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.postalCode}
                <br />
                {order.shippingAddress?.country}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Fulfillment Controller */}
        <div className="space-y-6">
          {/* Status & Logistics Management Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Manage Fulfillment
            </h3>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              {/* Order Status Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Order Status
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:border-emerald-500 outline-none transition"
                >
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing & Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Courier Partner */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Courier Partner
                </label>
                <input
                  type="text"
                  value={statusForm.partner}
                  onChange={(e) => setStatusForm({ ...statusForm, partner: e.target.value })}
                  placeholder="e.g. Ekart, Delhivery, BlueDart"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-500 outline-none transition"
                />
              </div>

              {/* Tracking / AWB Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  AWB / Tracking Number
                </label>
                <input
                  type="text"
                  value={statusForm.trackingNumber}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, trackingNumber: e.target.value })
                  }
                  placeholder="e.g. EKP938201948"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-emerald-500 outline-none transition"
                />
              </div>

              {/* Milestone Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Milestone Location
                </label>
                <input
                  type="text"
                  value={statusForm.location}
                  onChange={(e) => setStatusForm({ ...statusForm, location: e.target.value })}
                  placeholder="e.g. Dallas Hub / New York Sorting Facility"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-500 outline-none transition"
                />
              </div>

              {/* Payment Status Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={statusForm.paymentStatus}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, paymentStatus: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:border-emerald-500 outline-none transition"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  placeholder="Add private fulfillment notes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={order}
      />

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        orderNumber={order.orderNumber}
      />
    </div>
  );
}
