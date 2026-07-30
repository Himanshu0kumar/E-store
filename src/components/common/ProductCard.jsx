"use client";

import { Heart, Star } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <button
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-400 hover:text-rose-600 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Heart className="w-4 h-4" />
        </button>
        {product.discountPercent > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {product.category}
        </p>
        <h3 className="text-slate-900 font-semibold mt-1 truncate">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs text-slate-500">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5 mt-3">
          {product.colors.map((color) => (
            <span
              key={color.name}
              title={color.name}
              className="w-4 h-4 rounded-full border border-slate-200"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>

        <button className="w-full mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          Add to Cart
        </button>
      </div>
    </div>
  );
}