"use client";

import { createContext, useContext, useState, useCallback } from "react";
import Toast from "@/components/ui/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    setToast({ id: Date.now(), message, type, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const toastHelpers = {
    show: showToast,
    success: (msg, duration) => showToast(msg, "success", duration),
    error: (msg, duration) => showToast(msg, "error", duration),
    info: (msg, duration) => showToast(msg, "info", duration),
    cartAdd: (msg, duration) => showToast(msg, "cart_add", duration),
    cartExists: (msg, duration) => showToast(msg, "cart_exists", duration),
    cartUpdate: (msg, duration) => showToast(msg, "cart_update", duration),
    wishlistAdd: (msg, duration) => showToast(msg, "wishlist_add", duration),
    wishlistExists: (msg, duration) => showToast(msg, "wishlist_exists", duration),
    wishlistRemove: (msg, duration) => showToast(msg, "wishlist_remove", duration),
  };

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy object if used outside provider
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      cartAdd: () => {},
      cartExists: () => {},
      cartUpdate: () => {},
      wishlistAdd: () => {},
      wishlistExists: () => {},
      wishlistRemove: () => {},
    };
  }
  return context;
}
