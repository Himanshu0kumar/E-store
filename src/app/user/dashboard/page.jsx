"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  Settings,
  ChevronRight,
  Edit2,
  Plus,
  Trash2,
  Check,
  X,
  Loader,
  Wallet,
  Award,
  Home,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import {
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
} from "@/store/slices/authSlice";

// Small helper so the address type icon is consistent everywhere
// it appears (card badge). Purely presentational.
const addressTypeIcon = (type) => {
  if (type === "work") return Briefcase;
  if (type === "home") return Home;
  return MapPin;
};

// Tailwind-only toggle switch, styled to match the rest of the
// light theme. No behavior change from the native checkbox it
// replaces — still just a defaultChecked visual, no handler wired.
function ToggleSwitch({ defaultChecked }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner" />
    </label>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, addresses, loading, error, success } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const emptyAddressForm = {
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    type: "home",
    isDefault: false,
  };

  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [editForm, setEditForm] = useState(emptyAddressForm);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    bio: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Refetch the logged-in user's profile (and addresses) whenever
  // this page mounts — a page refresh clears Redux's in-memory
  // state, so this is what repopulates it from the still-valid
  // accessToken cookie. Without this, the dashboard only ever showed
  // data that happened to already be sitting in the store from a
  // prior action (e.g. right after adding an address), which is why
  // it looked empty on refresh or right after logging back in.
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  // Handle starting a profile edit
  const handleEditProfileClick = () => {
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    });
    setIsEditingProfile(true);
  };

  // Handle saving profile changes
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.name) {
      alert("Name is required");
      return;
    }

    const result = await dispatch(updateUserProfile(profileForm));

    if (updateUserProfile.fulfilled.match(result)) {
      setIsEditingProfile(false);
    }
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    const result = await dispatch(changePassword(passwordForm));

    if (changePassword.fulfilled.match(result)) {
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  // Handle add address
  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (!addressForm.street || !addressForm.city || !addressForm.postalCode) {
      alert("Please fill in all required fields");
      return;
    }

    const result = await dispatch(addAddress(addressForm));

    if (addAddress.fulfilled.match(result)) {
      setShowAddressForm(false);
      setAddressForm(emptyAddressForm);
    }
  };

  // Handle starting an edit
  const handleEditClick = (addr) => {
    setEditingAddressId(addr._id);
    setEditForm({
      name: addr.name || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "",
      phone: addr.phone || "",
      type: addr.type || "home",
      isDefault: addr.isDefault || false,
    });
  };

  // Handle update address
  const handleUpdateAddress = async (e) => {
    e.preventDefault();

    if (!editForm.street || !editForm.city || !editForm.postalCode) {
      alert("Please fill in all required fields");
      return;
    }

    const result = await dispatch(
      updateAddress({ addressId: editingAddressId, data: editForm })
    );

    if (updateAddress.fulfilled.match(result)) {
      setEditingAddressId(null);
      setEditForm(emptyAddressForm);
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      await dispatch(deleteAddress(addressId));
    }
  };

  // Close error/success messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        // Clear message
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-semibold ring-4 ring-emerald-50 shrink-0">
                {initial}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {user?.name?.split(" ")[0] || "there"}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
            <span>{error}</span>
            <X className="w-4 h-4 cursor-pointer shrink-0" />
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Operation completed successfully
            </span>
            <X className="w-4 h-4 cursor-pointer shrink-0" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-3 space-y-1 lg:sticky lg:top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
                        isActive ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="font-medium text-sm">{tab.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                  {!isEditingProfile ? (
                    <>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-semibold ring-4 ring-emerald-50 shrink-0">
                            {initial}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                              {user?.name}
                            </h2>
                            <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
                            {user?.phone && (
                              <p className="text-slate-500 text-sm">{user?.phone}</p>
                            )}
                            {user?.bio && (
                              <p className="text-slate-500 text-sm mt-1 italic">{user?.bio}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={handleEditProfileClick}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition text-sm font-medium shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Orders
                          </div>
                          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">0</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
                            <Wallet className="w-3.5 h-3.5" />
                            Spent
                          </div>
                          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">$0</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-amber-700 text-xs font-medium uppercase tracking-wide">
                            <Award className="w-3.5 h-3.5" />
                            Points
                          </div>
                          <p className="text-2xl font-bold text-amber-700 mt-2 tabular-nums">0</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h3>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1.5">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, name: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1.5">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, phone: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1.5">
                            Bio
                          </label>
                          <textarea
                            value={profileForm.bio}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, bio: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          />
                        </div>

                        <div className="flex gap-3 pt-1">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            <Check className="w-4 h-4" />
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <a
                    href="/products"
                    className="group bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-slate-900 font-semibold text-sm">Continue Shopping</p>
                  </a>
                  <button
                    onClick={() => setActiveTab("wishlist")}
                    className="group bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-rose-50 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-rose-600" />
                    </div>
                    <p className="text-slate-900 font-semibold text-sm">My Wishlist</p>
                    {wishlistItems.length > 0 && (
                      <p className="text-slate-500 text-xs mt-1">
                        {wishlistItems.length} items
                      </p>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="group bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-50 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-slate-900 font-semibold text-sm">My Orders</p>
                  </button>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    No orders yet
                  </h3>
                  <p className="text-slate-500 mb-6 text-sm">
                    Start shopping to see your orders here
                  </p>
                  <a
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Browse Products
                  </a>
                </div>
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                {wishlistItems.length === 0 ? (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        No items in wishlist
                      </h3>
                      <p className="text-slate-500 mb-6 text-sm">
                        Add your favorite items to your wishlist
                      </p>
                      <a
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <Heart className="w-4 h-4" />
                        Explore Products
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      My Wishlist ({wishlistItems.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlistItems.map((item) => (
                        <div
                          key={item._id}
                          className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-4"
                        >
                          <img
                            src={item.productId?.images?.[0] || "/placeholder.jpg"}
                            alt={item.productId?.name}
                            className="w-20 h-20 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-semibold truncate">
                              {item.productId?.name}
                            </p>
                            <p className="text-emerald-600 font-bold mt-1">
                              ${item.productId?.regularPrice}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-4">
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Address
                  </button>
                )}

                {/* Add Address Form */}
                {showAddressForm && (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      Add New Address
                    </h3>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={addressForm.name}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, name: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, phone: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Street Address *"
                        value={addressForm.street}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, street: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        required
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City *"
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, city: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={addressForm.state}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, state: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Postal Code *"
                          value={addressForm.postalCode}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, postalCode: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={addressForm.country}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, country: e.target.value })
                          }
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                      </div>

                      <select
                        value={addressForm.type}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, type: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>

                      <label className="flex items-center gap-3 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, isDefault: e.target.checked })
                          }
                          className="w-4 h-4 accent-emerald-600 rounded"
                        />
                        <span className="text-slate-600 text-sm">Set as default address</span>
                      </label>

                      <div className="flex gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          {loading ? "Adding..." : "Add Address"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Addresses List */}
                {addresses && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const TypeIcon = addressTypeIcon(addr.type);

                      return editingAddressId === addr._id ? (
                        // ---- EDIT FORM (inline, replaces the card) ----
                        <div
                          key={addr._id}
                          className="bg-white border border-emerald-300 shadow-sm rounded-2xl p-6 md:col-span-2"
                        >
                          <h4 className="text-slate-900 font-bold mb-4">Edit Address</h4>
                          <form onSubmit={handleUpdateAddress} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="Full Name"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, name: e.target.value })
                                }
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                              />
                              <input
                                type="tel"
                                placeholder="Phone"
                                value={editForm.phone}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, phone: e.target.value })
                                }
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                              />
                            </div>

                            <input
                              type="text"
                              placeholder="Street Address *"
                              value={editForm.street}
                              onChange={(e) =>
                                setEditForm({ ...editForm, street: e.target.value })
                              }
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                              required
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="City *"
                                value={editForm.city}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, city: e.target.value })
                                }
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                                required
                              />
                              <input
                                type="text"
                                placeholder="State"
                                value={editForm.state}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, state: e.target.value })
                                }
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="Postal Code *"
                                value={editForm.postalCode}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, postalCode: e.target.value })
                                }
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Country"
                                value={editForm.country}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, country: e.target.value })
                                }
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                              />
                            </div>

                            <select
                              value={editForm.type}
                              onChange={(e) =>
                                setEditForm({ ...editForm, type: e.target.value })
                              }
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                            >
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </select>

                            <label className="flex items-center gap-3 cursor-pointer w-fit">
                              <input
                                type="checkbox"
                                checked={editForm.isDefault}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, isDefault: e.target.checked })
                                }
                                className="w-4 h-4 accent-emerald-600 rounded"
                              />
                              <span className="text-slate-600 text-sm">
                                Set as default address
                              </span>
                            </label>

                            <div className="flex gap-3 pt-1">
                              <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                <Check className="w-4 h-4" />
                                {loading ? "Saving..." : "Save Changes"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingAddressId(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        // ---- READ-ONLY CARD ----
                        <div
                          key={addr._id}
                          className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <TypeIcon className="w-5 h-5 text-slate-500" />
                              </div>
                              <div>
                                <h4 className="text-slate-900 font-bold">{addr.name}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-xs text-slate-500 capitalize">
                                    {addr.type}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleEditClick(addr)}
                                className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                aria-label="Edit address"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                aria-label="Delete address"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="text-slate-600 text-sm space-y-0.5 pl-[52px]">
                            <p>{addr.street}</p>
                            <p>
                              {addr.city}, {addr.state} {addr.postalCode}
                            </p>
                            <p>{addr.country}</p>
                            {addr.phone && <p>Phone: {addr.phone}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  !showAddressForm && (
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        No addresses yet
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Add your delivery address to get started
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Preferences */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-5">
                    Preferences
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-slate-900 font-medium text-sm">Newsletter</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Receive emails about new products
                        </p>
                      </div>
                      <ToggleSwitch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-slate-900 font-medium text-sm">Notifications</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Get notified about your orders
                        </p>
                      </div>
                      <ToggleSwitch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-5">
                    Security
                  </h3>

                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium text-sm">Change Password</p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            Update your password regularly
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                          New Password *
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          required
                        />
                      </div>

                      <div className="flex gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <Check className="w-4 h-4" />
                          {loading ? "Updating..." : "Update Password"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordForm({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}