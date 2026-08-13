"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Share2,
  ChevronLeft,
  ShoppingCart,
} from "lucide-react";
import { fetchProductById } from "@/store/slices/productSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import ProductDetailsView from "@/components/ui/ProductDetailsView";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector((state) => state.products);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch product on mount
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, dispatch]);

  // Set initial color and size
  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.colors && selectedProduct.colors.length > 0) {
        setSelectedColor(selectedProduct.colors[0]);
      }
      if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
        setSelectedSize(selectedProduct.sizes[0]);
      }
    }
  }, [selectedProduct]);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    const pid = selectedProduct._id || selectedProduct.id;
    try {
      await dispatch(
        addToCart({
          productId: pid,
          quantity,
          selectedColor,
          selectedSize,
        })
      );
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!selectedProduct) return;
    const pid = selectedProduct._id || selectedProduct.id;
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    try {
      if (nextState) {
        await dispatch(addToWishlist({ productId: pid }));
      } else {
        await dispatch(removeFromWishlist(pid));
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="mt-4 text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-600">Product not found</p>
      </div>
    );
  }

  const images = selectedProduct.images || [];

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-900"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </Link>

            <div className="flex gap-3">
              <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100">
                <Share2 size={20} />
              </button>
              <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100">
                ⋮
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* IMAGE GALLERY */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={images[selectedImage] || "/placeholder.png"}
                alt={selectedProduct.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === index
                        ? "border-emerald-500"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition ${
                  addedToCart
                    ? "bg-emerald-700"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                <ShoppingCart size={20} />
                {addedToCart ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`rounded-xl border-2 px-6 py-3 font-semibold transition ${
                  isWishlisted
                    ? "border-rose-500 bg-rose-50 text-rose-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Heart
                  size={20}
                  className={isWishlisted ? "fill-current" : ""}
                />
              </button>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-900">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 transition hover:bg-slate-50"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value)))
                  }
                  className="w-16 rounded-lg border border-slate-200 px-3 py-2 text-center text-slate-900 outline-none"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 transition hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Colors */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">
                  Colors
                </label>
                <div className="flex gap-3">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 w-10 rounded-full border-2 transition ${
                        selectedColor === color
                          ? "border-emerald-500"
                          : "border-slate-200"
                      }`}
                      style={{
                        backgroundColor: getColorCode(color),
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">
                  Sizes
                </label>
                <div className="flex gap-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border-2 px-6 py-2 text-sm font-semibold transition ${
                        selectedSize === size
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Info Notes */}
            <div className="space-y-2 text-sm text-slate-600">
              <p>✓ Free Delivery on orders above $50</p>
              <p>✓ 7-day Easy Return Guarantee</p>
              <p>✓ Authentic & Quality Assured</p>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAILS SECTION */}
      <div className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <ProductDetailsView product={selectedProduct} isAdmin={false} />
        </div>
      </div>
    </div>
  );
}

// Helper function to convert color names to hex codes
function getColorCode(colorName) {
  const colors = {
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#10b981",
    black: "#1f2937",
    white: "#f3f4f6",
    yellow: "#fbbf24",
    purple: "#a855f7",
    pink: "#ec4899",
  };
  return colors[colorName.toLowerCase()] || "#e5e7eb";
}