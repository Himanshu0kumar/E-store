"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Truck,
  Check,
  Lock,
  Loader,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ----------------------------------------------------------------
// Mock order contents — mirror whatever the cart page ends up
// passing along (via your real cart state/API) instead of this
// hardcoded array.
// ----------------------------------------------------------------
const ORDER_ITEMS = [
  { id: 1, name: "Classic Crewneck Tee", variant: "Black / M", price: 28.0, quantity: 2 },
  { id: 4, name: "Everyday Sneakers", variant: "White / 9", price: 74.99, quantity: 1 },
  { id: 8, name: "Minimalist Watch", variant: "Silver", price: 129.0, quantity: 1 },
];

const SHIPPING_FLAT_RATE = 6.99;
const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.08;

const STEPS = ["Information", "Shipping", "Payment"];

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [contact, setContact] = useState({ email: "", phone: "" });
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    nameOnCard: "",
  });

  const subtotal = useMemo(
    () => ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0),
    []
  );
  const shippingCost =
    shippingMethod === "express"
      ? 14.99
      : subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;

  const goNext = (e) => {
    e.preventDefault();
    setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = () => setCurrentStep((s) => Math.max(0, s - 1));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    // TODO: replace with a real order-creation API call, e.g.
    // await api.post("/api/orders", { contact, shippingAddress, shippingMethod, paymentMethod, items: ORDER_ITEMS });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setPlacingOrder(false);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Order confirmed
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              A confirmation has been sent to {contact.email || "your email"}.
              Your total was <span className="font-semibold">${total.toFixed(2)}</span>.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      {/* Step indicator */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
            Checkout
          </h1>
          <div className="flex items-center gap-2 text-sm">
            {STEPS.map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      idx <= currentStep
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {idx < currentStep ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <span
                    className={
                      idx <= currentStep
                        ? "text-slate-900 font-medium"
                        : "text-slate-400"
                    }
                  >
                    {step}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
              {/* STEP 0: Information */}
              {currentStep === 0 && (
                <form onSubmit={goNext} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                      Contact Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={contact.email}
                          onChange={(e) =>
                            setContact({ ...contact, email: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) =>
                            setContact({ ...contact, phone: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        required
                        value={shippingAddress.fullName}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      />
                      <input
                        type="text"
                        placeholder="Street Address *"
                        required
                        value={shippingAddress.street}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, street: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City *"
                          required
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, city: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={shippingAddress.state}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, state: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Postal Code *"
                          required
                          value={shippingAddress.postalCode}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                        <input
                          type="text"
                          placeholder="Country *"
                          required
                          value={shippingAddress.country}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, country: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
                  >
                    Continue to Shipping
                  </button>
                </form>
              )}

              {/* STEP 1: Shipping method */}
              {currentStep === 1 && (
                <form onSubmit={goNext} className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Shipping Method
                  </h2>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                        shippingMethod === "standard"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={shippingMethod === "standard"}
                          onChange={() => setShippingMethod("standard")}
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <div>
                          <p className="text-slate-900 font-medium text-sm">
                            Standard Shipping
                          </p>
                          <p className="text-slate-500 text-xs">5–7 business days</p>
                        </div>
                      </div>
                      <span className="text-slate-900 font-semibold text-sm">
                        {subtotal >= FREE_SHIPPING_THRESHOLD
                          ? "Free"
                          : `$${SHIPPING_FLAT_RATE.toFixed(2)}`}
                      </span>
                    </label>

                    <label
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                        shippingMethod === "express"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={shippingMethod === "express"}
                          onChange={() => setShippingMethod("express")}
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <div>
                          <p className="text-slate-900 font-medium text-sm">
                            Express Shipping
                          </p>
                          <p className="text-slate-500 text-xs">1–2 business days</p>
                        </div>
                      </div>
                      <span className="text-slate-900 font-semibold text-sm">$14.99</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Payment */}
              {currentStep === 2 && (
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Payment
                  </h2>

                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "card"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-900">
                        Credit or Debit Card
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "cod"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <Truck className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-900">
                        Cash on Delivery
                      </span>
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 pt-2">
                      <input
                        type="text"
                        placeholder="Name on Card *"
                        required
                        value={cardDetails.nameOnCard}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, nameOnCard: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Card Number *"
                        required
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, number: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM / YY *"
                          required
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, expiry: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="CVC *"
                          required
                          value={cardDetails.cvc}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cvc: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={placingOrder}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {placingOrder ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        `Place Order — $${total.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-4">
                {ORDER_ITEMS.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="text-slate-600">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.variant} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-slate-900 font-medium tabular-nums shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-200 mb-4" />

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span className="tabular-nums">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="h-px bg-slate-200 my-4" />

              <div className="flex justify-between items-baseline">
                <span className="text-slate-900 font-semibold">Total</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}