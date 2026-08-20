"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Check,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const STANDARD_STEPS = [
  { key: "placed", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: Check },
];

export default function OrderTracker({ order, showHistory = true }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  if (!order) return null;

  const { orderStatus, trackingEvents = [], courierInfo = {}, createdAt, deliveredAt } = order;
  const isCancelled = orderStatus === "cancelled";
  const isReturned = orderStatus === "returned";

  // Determine current active step index for standard flow
  const statusStepMap = {
    placed: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
  };

  const currentStepIndex = statusStepMap[orderStatus] ?? 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-sm">
      {/* Courier & Expected Date Header (Flipkart / Meesho banner) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {orderStatus?.replace("_", " ")}
            </span>
            {courierInfo?.partner && (
              <span className="text-xs text-slate-500 font-medium">
                via <strong className="text-slate-700">{courierInfo.partner}</strong>
              </span>
            )}
          </div>
          {courierInfo?.trackingNumber && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              AWB Tracking No: <span className="font-semibold text-slate-800">{courierInfo.trackingNumber}</span>
            </p>
          )}
        </div>

        <div className="text-right">
          {orderStatus === "delivered" ? (
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Delivered on {formatDate(deliveredAt || order.updatedAt)}
            </p>
          ) : isCancelled ? (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Order Cancelled
            </p>
          ) : (
            <div>
              <p className="text-xs text-slate-400 font-medium">Estimated Delivery</p>
              <p className="text-sm font-bold text-slate-800">
                {courierInfo?.estimatedDelivery
                  ? new Date(courierInfo.estimatedDelivery).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "Within 4–6 Business Days"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Visual Stepper Bar */}
      {isCancelled ? (
        <div className="py-6 flex items-center gap-3 text-rose-600 bg-rose-50/70 border border-rose-200 rounded-xl p-4 my-6">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">This order was cancelled</p>
            <p className="text-xs text-rose-500 mt-0.5">
              {order.cancellation?.reason
                ? `Reason: ${order.cancellation.reason}`
                : "Cancellation requested by customer."}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-8">
          {/* Desktop Stepper */}
          <div className="hidden sm:flex items-center justify-between relative">
            {/* Progress line background */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 rounded-full z-0" />
            {/* Active progress fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(currentStepIndex / (STANDARD_STEPS.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-5 left-8 h-1 bg-emerald-500 rounded-full z-0"
              style={{
                maxWidth: "calc(100% - 4rem)",
              }}
            />

            {STANDARD_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: isCurrent ? 1.15 : 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                      isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    {/* Pulsing halo ring on current active step */}
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping" />
                    )}

                    {isCompleted && idx < currentStepIndex ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <StepIcon className="w-4 h-4 relative z-10" />
                    )}
                  </motion.div>

                  <span
                    className={`text-xs mt-2.5 font-semibold text-center whitespace-nowrap ${
                      isCurrent
                        ? "text-emerald-700 font-bold"
                        : isCompleted
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Stepper */}
          <div className="sm:hidden space-y-6 relative pl-6 border-l-2 border-slate-100 ml-4">
            {STANDARD_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative flex items-center gap-3"
                >
                  <div
                    className={`relative -left-[31px] w-7 h-7 rounded-full flex items-center justify-center border-2 transition ${
                      isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-200 text-slate-300"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping" />
                    )}
                    {isCompleted && idx < currentStepIndex ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <StepIcon className="w-3 h-3 relative z-10" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-emerald-700"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accordion for detailed tracking activity history */}
      {showHistory && trackingEvents.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <span>Activity & Milestone Updates ({trackingEvents.length})</span>
            {isHistoryOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isHistoryOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3.5 pl-2"
            >
              {[...trackingEvents].reverse().map((ev, i) => (
                <motion.div
                  key={ev._id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 text-xs border-l-2 border-emerald-500 pl-3 py-0.5"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{ev.title}</p>
                    {ev.description && (
                      <p className="text-slate-500 mt-0.5">{ev.description}</p>
                    )}
                    {ev.location && (
                      <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {ev.location}
                      </p>
                    )}
                  </div>
                  <span className="text-slate-400 whitespace-nowrap text-[11px]">
                    {formatDate(ev.timestamp)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
