"use client";

import { useEffect } from "react";
import { Check, Heart, ShoppingBag, AlertCircle, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const icons = {
    success: <Check className="w-4 h-4 text-emerald-400 shrink-0" />,
    wishlist_add: <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />,
    wishlist_remove: <Heart className="w-4 h-4 text-slate-400 shrink-0" />,
    wishlist_exists: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
    cart_add: <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />,
    cart_remove: <ShoppingBag className="w-4 h-4 text-rose-400 shrink-0" />,
    cart_exists: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
    cart_update: <ShoppingBag className="w-4 h-4 text-blue-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-slate-700/80 backdrop-blur-md max-w-md"
        >
          {icons[type] || icons.success}
          <span className="flex-1">{message}</span>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-0.5 rounded-lg hover:bg-slate-800"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

