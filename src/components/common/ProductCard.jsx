"use client";

import { useState } from "react";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { addToCart } from "@/store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import Toast from "@/components/ui/Toast";


export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { items: wishlistItems = [] } = useSelector((state) => state.wishlist || {});
  const { items: cartItems = [] } = useSelector((state) => state.cart || {});
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState(null);

  if (!product) return null;

  const productId = product._id || product.id;
  const isWishlisted = Boolean(
    wishlistItems &&
      wishlistItems.some((item) => {
        const itemPid = item.productId?._id || item.productId || item._id;
        return String(itemPid) === String(productId);
      })
  );

  const isInCart = Boolean(
    cartItems &&
      cartItems.some((item) => {
        const itemPid = item.productId?._id || item.productId || item.product?._id || item.product?.id || item._id;
        return String(itemPid) === String(productId);
      })
  );

  const image =
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80");

  const name = product.name || "Untitled Product";
  const category = product.category || "General";

  const rawPrice =
    typeof product.price === "number"
      ? product.price
      : Number(product.salePrice ?? product.regularPrice ?? product.priceRange?.min) || 0;
  const price = isNaN(rawPrice) ? 0 : rawPrice;

  const rawOriginalPrice =
    typeof product.originalPrice === "number"
      ? product.originalPrice
      : (product.salePrice && product.regularPrice > product.salePrice ? Number(product.regularPrice) : null);
  const originalPrice = rawOriginalPrice && !isNaN(rawOriginalPrice) && rawOriginalPrice > price ? rawOriginalPrice : null;

  let discountPercent = Number(product.discountPercent) || 0;
  if (!discountPercent && originalPrice && price < originalPrice) {
    discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  const rating = typeof product.rating === "number" && product.rating > 0 ? product.rating : 4.5;
  const reviewCount = typeof product.reviewCount === "number" ? product.reviewCount : 12;

  // Process colors safely
  let colors = Array.isArray(product.colors) ? product.colors : [];
  if (colors.length === 0 && Array.isArray(product.attributes)) {
    const colorAttr = product.attributes.find(
      (a) => a?.name && a.name.toLowerCase() === "color"
    );
    if (colorAttr && Array.isArray(colorAttr.values)) {
      const colorHexMap = {
        black: "#0F172A",
        white: "#F8FAFC",
        red: "#E11D48",
        rose: "#E11D48",
        blue: "#2563EB",
        emerald: "#059669",
        green: "#059669",
        amber: "#D97706",
        yellow: "#EAB308",
        purple: "#9333EA",
        gray: "#64748B",
        slate: "#475569",
      };
      colors = colorAttr.values.map((val) => ({
        name: val,
        hex: typeof val === "string" ? (colorHexMap[val.toLowerCase()] || "#94A3B8") : "#94A3B8",
      }));
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;

    if (isInCart) {
      setToast({ message: "This product is already in your cart!", type: "cart_exists" });
      return;
    }

    setIsAdding(true);
    try {
      const res = await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      if (res?.alreadyExists) {
        setToast({ message: "Item quantity updated in cart!", type: "cart_update" });
      } else {
        setToast({ message: "Product added to cart successfully!", type: "cart_add" });
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setToast({ message: typeof err === "string" ? err : "Failed to add product to cart.", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!isWishlisted) {
        const res = await dispatch(addToWishlist({ productId })).unwrap();
        if (res?.alreadyExists) {
          setToast({ message: "Product is already in your wishlist!", type: "wishlist_exists" });
        } else {
          setToast({ message: "Product added to wishlist successfully!", type: "wishlist_add" });
        }
      } else {
        await dispatch(removeFromWishlist(productId)).unwrap();
        setToast({ message: "Product removed from your wishlist!", type: "wishlist_remove" });
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      setToast({ message: typeof err === "string" ? err : "Failed to update wishlist.", type: "error" });
    }
  };

  const cardContent = (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-shadow duration-300 flex flex-col justify-between h-full relative"
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div>
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
          />
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.82 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isWishlisted ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-rose-600"
            }`}
          >
            <motion.div
              animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
            </motion.div>
          </motion.button>
          {discountPercent > 0 && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.newLabel?.enabled && (
            <span className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-sm">
              {product.newLabel.value || "NEW"}
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
            {category}
          </p>
          <h3 className="text-slate-900 font-semibold mt-1 truncate group-hover:text-emerald-600 transition-colors">
            {name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs text-slate-500 font-medium">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-slate-900">
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {colors && colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              {colors.map((color, idx) => {
                const colorName = typeof color === "string" ? color : color.name || `color-${idx}`;
                const colorHex = typeof color === "string" ? color : color.hex || "#64748B";
                return (
                  <span
                    key={`${colorName}-${idx}`}
                    title={colorName}
                    className="w-4 h-4 rounded-full border border-slate-200 shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
          type="button"
          disabled={isAdding}
          onClick={handleAddToCart}
          className={`w-full mt-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            isInCart || added
              ? "bg-emerald-700 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md"
          }`}
        >
          {isInCart || added ? (
            <>
              <Check className="w-4 h-4" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  return productId ? (
    <Link href={`/product/${productId}`} className="block h-full">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}