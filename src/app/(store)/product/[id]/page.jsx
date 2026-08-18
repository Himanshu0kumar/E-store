"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Share2,
  ChevronRight,
  ShoppingCart,
  Zap,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Check,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import { fetchProductById, fetchProducts } from "@/store/slices/productSlice";
import { addToCart, fetchCart } from "@/store/slices/cartSlice";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "@/store/slices/wishlistSlice";
import { openAuthModal } from "@/store/slices/authSlice";
import ProductDetailsView from "@/components/ui/ProductDetailsView";
import { useToast } from "@/context/ToastContext";

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();

  const { user } = useSelector((state) => state.auth || {});
  const currentUser = user?.user || user;

  const { selectedProduct, items: allProducts, loading } = useSelector(
    (state) => state.products
  );
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const pid = selectedProduct?._id || selectedProduct?.id;

  // Determine if already in cart
  const isInCart = Boolean(
    cartItems &&
      cartItems.some((item) => {
        const itemPid =
          item.productId?._id || item.productId || item.product?._id || item.product?.id || item.product || item._id;
        return String(itemPid) === String(pid);
      })
  );

  // Determine if already in wishlist
  const isInWishlist = Boolean(
    wishlistItems &&
      wishlistItems.some((item) => {
        const itemPid =
          item.productId?._id || item.productId || item.product?._id || item.product?.id || item.product || item._id;
        return String(itemPid) === String(pid);
      })
  );

  const defaultColor =
    selectedProduct?.attributes?.find((a) => a.name.toLowerCase() === "color")?.values?.[0] ||
    selectedProduct?.colors?.[0] ||
    "";

  const defaultSize =
    selectedProduct?.attributes?.find((a) => a.name.toLowerCase() === "size")?.values?.[0] ||
    selectedProduct?.sizes?.[0] ||
    "";

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const activeColor = selectedColor || defaultColor;
  const activeSize = selectedSize || defaultSize;

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCart());
    dispatch(fetchWishlist());
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, dispatch]);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    if (!currentUser) {
      toast.error("Please log in to add items to your cart");
      return;
    }

    if (isInCart) {
      toast.cartExists("This product is already in your cart!");
      return;
    }

    try {
      await dispatch(
        addToCart({
          productId: pid,
          quantity,
          selectedColor: activeColor,
          selectedSize: activeSize,
        })
      );
      toast.cartAdd("Product added to cart successfully!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add product to cart.");
    }
  };

  const handleBuyNow = async () => {
    if (!currentUser) {
      toast.error("Please log in to proceed to checkout");
      return;
    }

    if (!isInCart) {
      await handleAddToCart();
    }
    router.push("/checkout");
  };

  const handleWishlistToggle = async () => {
    if (!selectedProduct) return;

    if (!currentUser) {
      toast.error("Please log in to save items to your wishlist");
      return;
    }
    try {
      if (!isInWishlist) {
        const res = await dispatch(addToWishlist({ productId: pid })).unwrap();
        if (res?.alreadyExists) {
          toast.wishlistExists("Product is already in your wishlist!");
        } else {
          toast.wishlistAdd("Product added to your wishlist successfully!");
        }
      } else {
        await dispatch(removeFromWishlist(pid)).unwrap();
        toast.wishlistRemove("Product removed from your wishlist!");
      }
    } catch (err) {
      console.error("Wishlist update failed:", err);
      toast.error(typeof err === "string" ? err : "Wishlist update failed.");
    }
  };

  // Filter Related Products (Same category, excluding current product)
  const relatedProducts = (allProducts || [])
    .filter((p) => {
      const pId = p._id || p.id;
      return (
        String(pId) !== String(pid) &&
        p.category &&
        selectedProduct?.category &&
        p.category.toLowerCase() === selectedProduct.category.toLowerCase()
      );
    })
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Loading product details...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-24 text-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Product Not Found
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              The product you requested might be out of stock or removed.
            </p>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition"
            >
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images =
    selectedProduct.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"];

  const regularPrice = Number(selectedProduct.regularPrice) || 0;
  const salePrice = Number(selectedProduct.salePrice) || 0;
  const effectivePrice = salePrice > 0 ? salePrice : regularPrice;

  let discountPercent = 0;
  if (salePrice > 0 && regularPrice > salePrice) {
    discountPercent = Math.round(
      ((regularPrice - salePrice) / regularPrice) * 100
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      {/* BREADCRUMB BAR */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link href="/product" className="hover:text-emerald-600 transition">
              Products
            </Link>
            {selectedProduct.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <Link
                  href={`/product?category=${encodeURIComponent(selectedProduct.category)}`}
                  className="hover:text-emerald-600 transition"
                >
                  {selectedProduct.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-800 line-clamp-1">
              {selectedProduct.name}
            </span>
          </div>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showNotification("Product link copied to clipboard!");
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* MAIN SHOWCASE CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-1 space-y-10">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN: SINGLE GALLERY & ACTION BUTTONS */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Thumbnails list */}
                {images.length > 1 && (
                  <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[440px] shrink-0">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                          selectedImage === idx
                            ? "border-emerald-600 shadow-xs"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Large Image Container */}
                <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 group">
                  <img
                    src={images[selectedImage]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Wishlist Floating Button */}
                  <button
                    onClick={handleWishlistToggle}
                    title={isInWishlist ? "Already in Wishlist" : "Add to Wishlist"}
                    className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md backdrop-blur-md transition ${
                      isInWishlist
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-white/90 text-slate-400 hover:text-rose-500"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isInWishlist ? "fill-rose-500 text-rose-500" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* DUAL ACTION BUTTONS BAR */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {isInCart ? (
                  <Link
                    href="/cart"
                    className="py-3.5 px-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs hover:bg-emerald-100"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    Already in Cart
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add To Cart
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Buy Now
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: PRODUCT DETAILS */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category & Title */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                    {selectedProduct.brand || selectedProduct.category || "Official Store"}
                  </span>
                  {selectedProduct.quantity > 0 ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> In Stock
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-rose-600">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                  {selectedProduct.name}
                </h1>
              </div>

              {/* Ratings & Reviews Pill */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-extrabold shadow-xs">
                  <span>{(selectedProduct.rating || 4.8).toFixed(1)}</span>
                  <Star className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  1,950 Ratings & 482 Reviews
                </span>
              </div>

              {/* Price Section */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900">
                    ${effectivePrice.toFixed(2)}
                  </span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        ${regularPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Inclusive of all taxes. Free shipping on orders over $50.
                </p>
              </div>

              {/* Variant Selector: Color */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Select Color: <span className="font-normal text-slate-500 capitalize">{activeColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedProduct.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          activeColor === c
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Selector: Size */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Select Size
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-11 h-10 rounded-xl text-xs font-bold uppercase transition border ${
                          activeSize === s
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Quantity
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-white transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery & Pincode Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Options
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Enter Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-28 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none"
                    />
                    <button
                      onClick={() => setPincodeChecked(true)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                    >
                      Check
                    </button>
                  </div>
                </div>

                {pincodeChecked && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Available for fast delivery to {pincode || "your location"}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>7 Days Return</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quality Assured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TABS: SPECIFICATIONS, DESCRIPTION, & REVIEWS */}
        <ProductDetailsView product={selectedProduct} />

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  You Might Also Like
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Related Products
                </h2>
              </div>
              <Link
                href={`/product?category=${encodeURIComponent(selectedProduct.category)}`}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition"
              >
                View More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}