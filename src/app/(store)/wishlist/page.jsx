"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ----------------------------------------------------------------
// Mock wishlist contents. If you already have a wishlist Redux
// slice (the dashboard page references `state.wishlist.items`),
// swap this for:
//
//   const { items } = useSelector((state) => state.wishlist);
//   const dispatch = useDispatch();
//   dispatch(removeFromWishlist(productId))  // instead of setItems below
//
// The card markup below doesn't care where the data comes from.
// ----------------------------------------------------------------
const INITIAL_WISHLIST = [
  {
    id: 8,
    name: "Minimalist Watch",
    category: "Accessories",
    price: 129.0,
    originalPrice: 129.0,
    rating: 4.6,
    reviewCount: 214,
    image: "https://picsum.photos/seed/product-8/600/600",
  },
  {
    id: 4,
    name: "Everyday Sneakers",
    category: "Footwear",
    price: 74.99,
    originalPrice: 89.99,
    rating: 4.3,
    reviewCount: 358,
    image: "https://picsum.photos/seed/product-4/600/600",
  },
  {
    id: 16,
    name: "Slim Fit Denim Jacket",
    category: "Clothing",
    price: 98.0,
    originalPrice: 98.0,
    rating: 4.7,
    reviewCount: 92,
    image: "https://picsum.photos/seed/product-16/600/600",
  },
];

export default function WishlistPage() {
  const [items, setItems] = useState(INITIAL_WISHLIST);

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
              <Heart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Your wishlist is empty
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Save items you love while you browse — they'll show up here.
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition text-sm"
            >
              Explore Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-rose-600 shadow-sm hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    {item.category}
                  </p>
                  <h3 className="text-slate-900 font-semibold mt-1 truncate">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-slate-500">
                      {item.rating.toFixed(1)} ({item.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-slate-900">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-sm text-slate-400 line-through">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}