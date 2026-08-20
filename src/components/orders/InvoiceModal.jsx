"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Printer, Download, X, Building, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRef } from "react";

export default function InvoiceModal({ isOpen, onClose, order }) {
  const invoiceRef = useRef(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const {
    orderNumber,
    createdAt,
    customer = {},
    shippingAddress = {},
    items = [],
    pricing = {},
    paymentInfo = {},
    orderStatus,
  } = order;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8 print:m-0 print:border-none print:shadow-none"
        >
          {/* Modal Header Actions (Hidden in Print) */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Tax Invoice — #{orderNumber}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Document Body */}
          <div ref={invoiceRef} className="p-8 sm:p-10 text-slate-800 space-y-8 print:p-0">
            {/* Top Brand & Order Info Bar */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base">
                    E
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    E-store<span className="text-emerald-600">.</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">E-Commerce Retail Ltd.</p>
                <p className="text-xs text-slate-400">GSTIN / Tax ID: 29ABCDE1234F1Z5</p>
                <p className="text-xs text-slate-400">support@e-store.com | +1 (800) 123-4567</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tax Invoice
                </span>
                <p className="text-lg font-black font-mono text-slate-900 mt-0.5">
                  #{orderNumber}
                </p>
                <p className="text-xs text-slate-500 mt-1">Date: {formattedDate}</p>
                <p className="text-xs text-slate-500">
                  Payment Mode:{" "}
                  <strong className="uppercase text-slate-700">
                    {paymentInfo.method || "Online"}
                  </strong>
                </p>
                <span
                  className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    paymentInfo.status === "paid"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  Payment: {paymentInfo.status || "Pending"}
                </span>
              </div>
            </div>

            {/* Bill To & Ship To Details */}
            <div className="grid grid-cols-2 gap-8 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-slate-400">
                  Customer / Billed To:
                </h4>
                <p className="font-bold text-slate-900 text-sm">
                  {shippingAddress.fullName || customer.name}
                </p>
                <p className="text-slate-600 mt-0.5">{customer.email}</p>
                <p className="text-slate-600">{customer.phone || shippingAddress.phone}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-slate-400">
                  Shipped / Delivered To:
                </h4>
                <p className="font-bold text-slate-900 text-sm">{shippingAddress.fullName}</p>
                <p className="text-slate-600 mt-0.5">{shippingAddress.street}</p>
                <p className="text-slate-600">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
                <p className="text-slate-600">{shippingAddress.country}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Item Description</th>
                    <th className="py-2.5 font-bold text-center">Qty</th>
                    <th className="py-2.5 font-bold text-right">Unit Price</th>
                    <th className="py-2.5 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const variantDetails = [item.selectedColor, item.selectedSize]
                      .filter(Boolean)
                      .join(" / ");

                    return (
                      <tr key={item._id || idx}>
                        <td className="py-3">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {variantDetails && (
                            <p className="text-slate-500 text-[11px]">
                              Variant: {variantDetails}
                            </p>
                          )}
                          {item.sku && (
                            <p className="text-slate-400 text-[10px] font-mono">SKU: {item.sku}</p>
                          )}
                        </td>
                        <td className="py-3 text-center font-medium text-slate-800">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-slate-600">
                          ${(item.price || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900">
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pricing Summary */}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-800">
                    ${(pricing.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount {pricing.couponCode ? `(${pricing.couponCode})` : ""}:</span>
                    <span>-${(pricing.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee:</span>
                  <span className="font-medium text-slate-800">
                    {pricing.shippingFee === 0 ? "Free" : `$${(pricing.shippingFee || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax (8%):</span>
                  <span className="font-medium text-slate-800">
                    ${(pricing.tax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-700 font-extrabold">
                    ${(pricing.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Terms & Signature */}
            <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-end">
              <div>
                <p className="font-semibold text-slate-600">Terms & Conditions:</p>
                <p>All sales are governed by our return policy within 14 days of delivery.</p>
                <p>This is a computer-generated tax invoice and does not require physical signature.</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700">Authorized Signatory</p>
                <p className="text-[10px] text-slate-400">E-store Retail Inc.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
