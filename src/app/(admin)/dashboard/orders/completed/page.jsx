"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, FileText, ShoppingBag, Loader, ArrowLeft } from "lucide-react";
import { fetchAdminOrders } from "@/store/slices/orderSlice";

export default function CompletedOrdersPage() {
  const dispatch = useDispatch();
  const { adminOrders = [], loading = false } = useSelector((state) => state.orders || {});

  useEffect(() => {
    dispatch(fetchAdminOrders({ status: "completed", limit: 20 }));
  }, [dispatch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Completed & Delivered Orders
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Successfully fulfilled and delivered customer shipments
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Fetching completed orders...</p>
          </div>
        ) : adminOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No completed orders yet</h3>
            <p className="text-xs text-slate-500 mt-0.5">Delivered orders will show up here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Customer</th>
                  <th className="py-3 px-4 font-bold">Delivered Date</th>
                  <th className="py-3 px-4 font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Payment</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminOrders.map((order, idx) => {
                  const deliveredDateStr = order.deliveredAt
                    ? new Date(order.deliveredAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : new Date(order.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      className="hover:bg-slate-50/75 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="hover:text-emerald-600 transition"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          {order.user?.name || order.customer?.name || "Customer"}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          {order.user?.email || order.customer?.email}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {deliveredDateStr}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        ${order.pricing?.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {order.paymentInfo?.status || "paid"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
