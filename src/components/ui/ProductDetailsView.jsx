"use client";

import { useState } from "react";
import { Star, Check, MessageSquare, ThumbsUp, ThumbsDown, Pencil } from "lucide-react";

export default function ProductDetailsView({ product, isAdmin = false }) {
  const [activeTab, setActiveTab] = useState("description");

  if (!product) return null;

  const rating = product.rating || 4.8;
  const reviewCount = 1950;

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      author: "Jayvion Simon",
      date: "14 Jul 2026",
      rating: 5,
      text: "Exceptional quality and fit! The material feels premium and breathable. Very satisfied with the quick delivery.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jayvion",
      helpful: 123,
      unhelpful: 4,
      verified: true,
    },
    {
      id: 2,
      author: "Lucian Obrien",
      date: "13 Jul 2026",
      rating: 4,
      text: "Great value for money. Looks exactly like the photos. The sizing chart was very accurate.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucian",
      helpful: 89,
      unhelpful: 2,
      verified: true,
    },
    {
      id: 3,
      author: "Deja Brady",
      date: "12 Jul 2026",
      rating: 5,
      text: "Fantastic product! Stitching and finish are top-tier. Will definitely order again.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deja",
      helpful: 102,
      unhelpful: 1,
      verified: true,
    },
  ];

  // Rating distribution
  const ratingDistribution = {
    5: { percent: 70, count: "1.36k" },
    4: { percent: 20, count: "390" },
    3: { percent: 6, count: "117" },
    2: { percent: 2, count: "39" },
    1: { percent: 2, count: "39" },
  };

  return (
    <div className="space-y-8">
      {/* TABS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* TAB HEADERS */}
        <div className="flex gap-6 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 font-bold text-sm transition whitespace-nowrap border-b-2 ${
              activeTab === "description"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Product Specifications & Details
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 font-bold text-sm transition whitespace-nowrap border-b-2 ${
              activeTab === "reviews"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Ratings & Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "description" && (
          <div className="space-y-8 text-slate-700">
            {/* SPECIFICATIONS TABLE */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Specifications
              </h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    {product.category && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500 bg-slate-50 font-medium w-1/3">
                          Category
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {product.category}
                        </td>
                      </tr>
                    )}
                    {product.brand && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500 bg-slate-50 font-medium w-1/3">
                          Brand
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {product.brand}
                        </td>
                      </tr>
                    )}
                    {product.productCode && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500 bg-slate-50 font-medium w-1/3">
                          Product Code
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {product.productCode}
                        </td>
                      </tr>
                    )}
                    {product.productSKU && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500 bg-slate-50 font-medium w-1/3">
                          SKU
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {product.productSKU}
                        </td>
                      </tr>
                    )}
                    {product.colors && product.colors.length > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500 bg-slate-50 font-medium w-1/3">
                          Available Colors
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {product.colors.join(", ")}
                        </td>
                      </tr>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500 bg-slate-50 font-medium w-1/3">
                          Available Sizes
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {product.sizes.map((s) => s.toUpperCase()).join(", ")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FULL DESCRIPTION */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Description
              </h3>
              <div className="text-xs leading-relaxed space-y-3">
                {product.description ? (
                  <div
                    className="prose max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-slate-600">
                    {product.subDescription || "High quality authentic product designed for daily comfort and durability."}
                  </p>
                )}
              </div>
            </div>

            {/* DELIVERY & WARRANTY NOTES */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Shipping & Guarantee
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 list-disc pl-5">
                <li>Free Standard Express Delivery on orders above $50.</li>
                <li>7-Day Replacement Guarantee for size exchanges or defects.</li>
                <li>100% Genuine and authentic quality inspected before dispatch.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* REVIEWS HEADER */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* RATING SUMMARY */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall Rating
                </h4>
                <div className="text-4xl font-black text-slate-900">
                  {rating.toFixed(1)} / 5
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${
                        i < Math.floor(rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Based on {reviewCount.toLocaleString()} verified customer ratings
                </p>
              </div>

              {/* RATING DISTRIBUTION */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="font-medium text-slate-700 w-12">
                      {stars} Star
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${ratingDistribution[stars].percent}%`,
                        }}
                      />
                    </div>
                    <span className="text-slate-500 w-12 text-right">
                      {ratingDistribution[stars].count}
                    </span>
                  </div>
                ))}
              </div>

              {/* WRITE REVIEW BUTTON */}
              <div className="flex justify-start lg:justify-end items-start pt-2">
                {!isAdmin && (
                  <button className="flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-200">
                    <Pencil className="w-4 h-4" />
                    Write a Review
                  </button>
                )}
              </div>
            </div>

            {/* REVIEWS LIST */}
            <div className="space-y-6 border-t border-slate-100 pt-6">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-2.5 pb-6 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="h-9 w-9 rounded-full bg-slate-100"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          {review.author}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {review.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={`${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {review.text}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verified Buyer
                    </span>
                    <button className="flex items-center gap-1 hover:text-slate-700 transition">
                      <ThumbsUp className="w-3.5 h-3.5" /> {review.helpful}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}