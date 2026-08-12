"use client";

import { useState } from "react";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const productId = product._id || product.id;
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

    setIsAdding(true);
    try {
      await dispatch(addToCart({ productId, quantity: 1 }));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !wishlisted;
    setWishlisted(nextState);

    try {
      if (nextState) {
        await dispatch(addToWishlist({ productId }));
      } else {
        await dispatch(removeFromWishlist(productId));
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    }
  };

  const cardContent = (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between h-full">
      <div>
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              wishlisted ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-rose-600"
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
          </button>
          {discountPercent > 0 && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold">
              -{discountPercent}%
            </span>
          )}
          {product.newLabel?.enabled && (
            <span className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
              {product.newLabel.value || "NEW"}
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            {category}
          </p>
          <h3 className="text-slate-900 font-semibold mt-1 truncate group-hover:text-emerald-600 transition">
            {name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs text-slate-500">
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
        <button
          type="button"
          disabled={isAdding}
          onClick={handleAddToCart}
          className={`w-full mt-4 px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            added
              ? "bg-emerald-700 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );

  return productId ? (
    <Link href={`/product/${productId}`} className="block h-full">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}