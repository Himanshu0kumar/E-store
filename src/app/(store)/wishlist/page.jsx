"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, ShoppingCart, Trash2, Star, Check, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector((state) => state.wishlist || {});
  const [addingCartId, setAddingCartId] = useState(null);
  const [addedCartIds, setAddedCartIds] = useState([]);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const formattedItems = useMemo(() => {
    return items.map((item) => {
      const product =
        typeof item.productId === "object" && item.productId !== null
          ? item.productId
          : {};
      const itemId =
        item._id ||
        item.id ||
        (typeof item.productId === "string" ? item.productId : product._id);
      const name = product.name || item.name || "Wishlist Item";
      const category = product.category || item.category || "General";
      const price = item.price ?? product.salePrice ?? product.regularPrice ?? 0;
      const originalPrice = product.regularPrice || item.originalPrice || price;
      const rating = product.rating || item.rating || 5.0;
      const reviewCount = item.reviewCount || 12;
      const image =
        product.images?.[0] ||
        product.image ||
        item.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";

      return {
        id: itemId,
        productId: product._id || item.productId,
        name,
        category,
        price,
        originalPrice,
        rating,
        reviewCount,
        image,
      };
    });
  }, [items]);

  const handleRemove = (itemId) => {
    if (!itemId) return;
    dispatch(removeFromWishlist(itemId));
  };

  const handleAddToCart = async (product) => {
    if (!product.productId) return;
    setAddingCartId(product.id);
    try {
      await dispatch(addToCart({ productId: product.productId, quantity: 1 })).unwrap();
      setAddedCartIds((prev) => [...prev, product.id]);
      setTimeout(() => {
        setAddedCartIds((prev) => prev.filter((id) => id !== product.id));
      }, 2000);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setAddingCartId(null);
    }
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
            {formattedItems.length} {formattedItems.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        {loading && formattedItems.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-16 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-emerald-600 animate-spin mb-3" />
            <p className="text-slate-600 text-sm font-medium">Loading your wishlist...</p>
          </div>
        ) : formattedItems.length === 0 ? (
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
              href="/product"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition text-sm"
            >
              Explore Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {formattedItems.map((item) => {
              const isAdded = addedCartIds.includes(item.id);
              const isAdding = addingCartId === item.id;

              return (
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
                      onClick={() => handleRemove(item.id)}
                      aria-label="Remove from wishlist"
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-rose-600 shadow-sm hover:bg-rose-50 transition shrink-0"
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

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isAdding}
                      className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                        isAdded
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding...
                        </>
                      ) : isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}