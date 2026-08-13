"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
} from "@/store/slices/cartSlice";

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FLAT_RATE = 6.99;
const TAX_RATE = 0.08;

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    items = [],
    subtotal = 0,
    tax = 0,
    shipping = 0,
    discount = 0,
    total = 0,
    couponCode: appliedCouponCode = null,
    loading = false,
  } = useSelector((state) => state.cart || {});

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Sync coupon code if applied from backend
  useEffect(() => {
    if (appliedCouponCode) {
      setAppliedPromo({
        code: appliedCouponCode,
        percentOff: discount > 0 ? Math.round((discount / (subtotal || 1)) * 100) : 10,
      });
    }
  }, [appliedCouponCode, discount, subtotal]);

  const formattedItems = useMemo(() => {
    return items.map((item) => {
      const product =
        typeof item.productId === "object" && item.productId !== null
          ? item.productId
          : {};
      const name = product.name || item.name || "Product Item";
      const image =
        product.images?.[0] ||
        product.image ||
        item.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";
      const price = item.price ?? product.salePrice ?? product.regularPrice ?? 0;
      const variantParts = [item.selectedColor, item.selectedSize].filter(Boolean);
      const variant =
        variantParts.length > 0
          ? variantParts.join(" / ")
          : product.category || "Standard";

      const itemId =
        item._id ||
        item.id ||
        (typeof item.productId === "string" ? item.productId : product._id);

      return {
        id: itemId,
        productId: product._id || item.productId,
        name,
        variant,
        price,
        quantity: item.quantity || 1,
        image,
      };
    });
  }, [items]);

  const updateQuantity = (itemId, delta, currentQty) => {
    if (!itemId) return;
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    dispatch(updateCartItem({ itemId, quantity: newQty }));
  };

  const removeItem = (itemId) => {
    if (!itemId) return;
    dispatch(removeFromCart(itemId));
  };

  const applyPromoCodeHandler = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    dispatch(applyCoupon({ couponCode: promoCode.trim(), discount: 10 }))
      .unwrap()
      .then(() => {
        setAppliedPromo({ code: promoCode.trim(), percentOff: 10 });
        setPromoError("");
      })
      .catch((err) => {
        setPromoError(err || "Invalid promo code");
      });
  };

  const calculatedSubtotal = useMemo(() => {
    return subtotal > 0
      ? subtotal
      : formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [subtotal, formattedItems]);

  const calculatedDiscount = appliedPromo
    ? calculatedSubtotal * ((appliedPromo.percentOff || 10) / 100)
    : discount;
  const calculatedShipping =
    shipping > 0
      ? shipping
      : calculatedSubtotal === 0 || calculatedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT_RATE;
  const calculatedTax =
    tax > 0 ? tax : (calculatedSubtotal - calculatedDiscount) * TAX_RATE;
  const calculatedTotal =
    total > 0
      ? total
      : calculatedSubtotal - calculatedDiscount + calculatedShipping + calculatedTax;

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - calculatedSubtotal);

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Your Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {formattedItems.length} {formattedItems.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        {loading && formattedItems.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-16 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-emerald-600 animate-spin mb-3" />
            <p className="text-slate-600 text-sm font-medium">Loading your cart...</p>
          </div>
        ) : formattedItems.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Your cart is empty
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Looks like you haven't added anything yet
            </p>
            <a
              href="/product"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition text-sm"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free shipping progress */}
              {amountToFreeShipping > 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-sm text-emerald-800">
                    Add <span className="font-semibold">${amountToFreeShipping.toFixed(2)}</span> more
                    for free shipping
                  </p>
                  <div className="w-full h-1.5 bg-emerald-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (calculatedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800 font-medium">
                  🎉 You've unlocked free shipping
                </div>
              )}

              {formattedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-slate-900 font-semibold truncate">
                          {item.name}
                        </p>
                        <p className="text-slate-500 text-sm mt-0.5">
                          {item.variant}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1, item.quantity)}
                          aria-label="Decrease quantity"
                          className="p-2 text-slate-500 hover:text-slate-900 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1, item.quantity)}
                          aria-label="Increase quantity"
                          className="p-2 text-slate-500 hover:text-slate-900 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-900 font-bold tabular-nums">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Order Summary
                </h2>

                {/* Promo code */}
                <form onSubmit={applyPromoCodeHandler} className="mb-5">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-rose-600 text-xs mt-1.5">{promoError}</p>
                  )}
                  {appliedPromo && (
                    <p className="text-emerald-600 text-xs mt-1.5">
                      {appliedPromo.code} applied — {appliedPromo.percentOff}% off
                    </p>
                  )}
                </form>

                <div className="h-px bg-slate-200 mb-4" />

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums">${calculatedSubtotal.toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedPromo.percentOff}%)</span>
                      <span className="tabular-nums">-${calculatedDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="tabular-nums">
                      {calculatedShipping === 0 ? "Free" : `$${calculatedShipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="tabular-nums">${calculatedTax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-200 my-4" />

                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-slate-900 font-semibold">Total</span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    ${calculatedTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}