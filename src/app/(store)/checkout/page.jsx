"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Truck,
  Check,
  Lock,
  Loader,
  ChevronRight,
  MapPin,
  Home,
  Briefcase,
  Plus,
  CheckCircle2,
  UserCheck,
  Sparkles,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchCart } from "@/store/slices/cartSlice";
import { getAddresses, getUserProfile, addAddress } from "@/store/slices/authSlice";

const SHIPPING_FLAT_RATE = 6.99;
const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.08;

const STEPS = ["Information", "Shipping", "Payment"];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const cartState = useSelector((state) => state.cart || {});
  const cartItemsRaw = cartState.items || [];

  const {
    isAuthenticated = false,
    user = null,
    addresses = [],
    loading: authLoading = false,
  } = useSelector((state) => state.auth || {});

  const isUserLoggedIn = isAuthenticated || Boolean(user);

  // Fetch cart & user profile + saved addresses on mount
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(getUserProfile());
    dispatch(getAddresses());
  }, [dispatch]);

  // Auth guard check
  useEffect(() => {
    if (!authLoading && !isUserLoggedIn) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, isUserLoggedIn, router]);

  const orderItems = useMemo(() => {
    return cartItemsRaw.map((item) => {
      const product =
        typeof item.productId === "object" && item.productId !== null
          ? item.productId
          : {};
      const name = product.name || item.name || "Product Item";
      const price = item.price ?? product.salePrice ?? product.regularPrice ?? 0;
      const variantParts = [item.selectedColor, item.selectedSize].filter(Boolean);
      const variant =
        variantParts.length > 0
          ? variantParts.join(" / ")
          : product.category || "Standard";

      return {
        id: item._id,
        name,
        variant,
        price,
        quantity: item.quantity || 1,
      };
    });
  }, [cartItemsRaw]);

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
    country: "United States",
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveNewAddressToAccount, setSaveNewAddressToAccount] = useState(false);

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    nameOnCard: "",
  });

  // Pre-fill user contact info when profile loads
  useEffect(() => {
    if (user) {
      setContact((prev) => ({
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Pre-select default or first saved address when addresses load
  useEffect(() => {
    if (isUserLoggedIn && addresses && addresses.length > 0 && !selectedAddressId && !useNewAddress) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setShippingAddress({
          fullName: defaultAddr.name || user?.name || "",
          street: defaultAddr.street || "",
          city: defaultAddr.city || "",
          state: defaultAddr.state || "",
          postalCode: defaultAddr.postalCode || "",
          country: defaultAddr.country || "United States",
        });
        if (defaultAddr.phone) {
          setContact((prev) => ({ ...prev, phone: defaultAddr.phone }));
        }
      }
    }
  }, [isUserLoggedIn, addresses, selectedAddressId, useNewAddress, user]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setUseNewAddress(false);
    setShippingAddress({
      fullName: addr.name || user?.name || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "United States",
    });
    if (addr.phone) {
      setContact((prev) => ({ ...prev, phone: addr.phone }));
    }
  };

  const handleToggleNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setShippingAddress({
      fullName: user?.name || "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
    });
  };

  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );
  const shippingCost =
    shippingMethod === "express"
      ? 14.99
      : subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;

  const goNext = async (e) => {
    e.preventDefault();

    // Save new address if requested by logged-in user
    if (currentStep === 0 && isUserLoggedIn && useNewAddress && saveNewAddressToAccount) {
      try {
        await dispatch(
          addAddress({
            name: shippingAddress.fullName,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            phone: contact.phone,
            type: "home",
          })
        ).unwrap();
        // Refresh address list
        dispatch(getAddresses());
      } catch (err) {
        console.error("Failed to save new address:", err);
      }
    }

    setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = () => setCurrentStep((s) => Math.max(0, s - 1));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    // Real order creation API simulation
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setPlacingOrder(false);
    setOrderPlaced(true);
  };

  const addressTypeIcon = (type) => {
    if (type === "work") return <Briefcase className="w-4 h-4 text-sky-600" />;
    return <Home className="w-4 h-4 text-emerald-600" />;
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center max-w-md w-full"
          >
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
              onClick={() => router.push("/product")}
              className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
            >
              Continue Shopping
            </button>
          </motion.div>
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
                  {/* Logged-in User Welcome Badge */}
                  {isUserLoggedIn && user && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-slate-800"
                    >
                      <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="flex-1 text-sm">
                        <p className="font-semibold text-slate-900">
                          Logged in as {user.name || user.email}
                        </p>
                        <p className="text-xs text-slate-600">
                          Select your delivery address below or add a new address to deliver your order.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Guest banner if NOT logged in */}
                  {!isUserLoggedIn && !authLoading && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Already have an account?</span>
                      </div>
                      <Link
                        href="/login?redirect=/checkout"
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Sign in for saved addresses
                      </Link>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                      Contact Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={contact.email}
                          onChange={(e) =>
                            setContact({ ...contact, email: e.target.value })
                          }
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) =>
                            setContact({ ...contact, phone: e.target.value })
                          }
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-slate-900">
                        Delivery Address
                      </h2>
                      {isUserLoggedIn && addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={handleToggleNewAddress}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Use New Address
                        </button>
                      )}
                    </div>

                    {/* Logged-in Saved Address Card Selection */}
                    {isUserLoggedIn && addresses.length > 0 && !useNewAddress ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {addresses.map((addr) => {
                            const isSelected = selectedAddressId === addr._id;

                            return (
                              <motion.div
                                key={addr._id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleSelectSavedAddress(addr)}
                                className={`relative cursor-pointer rounded-2xl border p-5 transition-all ${
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    {addressTypeIcon(addr.type)}
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                                      {addr.type || "Home"}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                      isSelected
                                        ? "border-emerald-600 bg-emerald-600 text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                  </div>
                                </div>

                                <p className="font-bold text-slate-900 text-sm">
                                  {addr.name || user?.name || "Delivery Recipient"}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {addr.street}
                                  <br />
                                  {addr.city}, {addr.state} {addr.postalCode}
                                  <br />
                                  {addr.country}
                                </p>
                                {addr.phone && (
                                  <p className="text-xs text-slate-400 mt-2 font-mono">
                                    Phone: {addr.phone}
                                  </p>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Manual / New Address Form */
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {isUserLoggedIn && addresses.length > 0 && (
                          <div className="flex items-center justify-between pb-2">
                            <span className="text-xs font-medium text-slate-500">
                              Entering a new delivery address
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setUseNewAddress(false);
                                const def = addresses.find((a) => a.isDefault) || addresses[0];
                                if (def) handleSelectSavedAddress(def);
                              }}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                            >
                              Cancel & choose saved address
                            </button>
                          </div>
                        )}

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
                            placeholder="State / Province *"
                            required
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

                        {isUserLoggedIn && (
                          <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveNewAddressToAccount}
                              onChange={(e) => setSaveNewAddressToAccount(e.target.checked)}
                              className="w-4 h-4 accent-emerald-600 rounded border-slate-300"
                            />
                            <span className="text-xs text-slate-600">
                              Save this address to my account for future orders
                            </span>
                          </label>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
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
                          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
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
                          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
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
                      className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-7 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
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
                          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
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
                          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
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
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-sm"
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
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-sm"
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
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-sm"
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
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={placingOrder}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
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
                {orderItems.map((item) => (
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