"use client";

import { useState } from "react";
import { Star, Check, MessageSquare , ThumbsUp ,ThumbsDown , Pencil } from "lucide-react";

export default function ProductDetailsView({ product, isAdmin = false }) {
  const [activeTab, setActiveTab] = useState("description");

  if (!product) return null;

  const images = product.images || [];
  const rating = product.rating || 4.2;
  const reviewCount = 1950;

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      author: "Jayvion Simon",
      date: "14 Jul 2026",
      rating: 4,
      text: "The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jayvion",
      helpful: 123,
      unhelpful: 34,
      verified: true,
    },
    {
      id: 2,
      author: "Lucian Obrien",
      date: "13 Jul 2026",
      rating: 4,
      text: "She eagerly opened the gift, her eyes sparkling with excitement.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucian",
      helpful: 89,
      unhelpful: 12,
      verified: true,
    },
    {
      id: 3,
      author: "Deja Brady",
      date: "12 Jul 2026",
      rating: 5,
      text: "The old oak tree stood tall and majestic, its branches swaying gently in the breeze.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deja",
      helpful: 102,
      unhelpful: 8,
      verified: true,
    },
  ];

  // Rating distribution
  const ratingDistribution = {
    5: { percent: 55, count: "2.03k" },
    4: { percent: 23, count: "8.49k" },
    3: { percent: 15, count: "6.98k" },
    2: { percent: 4, count: "9.12k" },
    1: { percent: 3, count: "1.95k" },
  };

  const getColorCode = (colorName) => {
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
  };

  return (
    <div className="space-y-8">
      {/* MAIN PRODUCT INFO */}
      <div className="grid gap-12 lg:grid-cols-2">
        {/* IMAGE GALLERY */}
        <div className="space-y-4">
          {images.length > 0 && (
            <>
              <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-slate-200"
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="space-y-6">
          {/* Title & Rating */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < Math.floor(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {rating} ({reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            {product.subDescription && (
              <p className="text-slate-600">{product.subDescription}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">
                ${Number(product.regularPrice).toFixed(2)}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    ${Number(product.salePrice).toFixed(2)}
                  </span>
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    Sale
                  </span>
                </>
              )}
            </div>
            {!isAdmin && (
              <p className="text-sm text-slate-600">
                Inclusive of all taxes. Free Shipping above $50.
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">
              Stock:
            </span>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                product.quantity > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.quantity > 0
                ? `${product.quantity} in stock`
                : "Out of stock"}
            </span>
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-900">
                Available Colors
              </label>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <div
                    key={color}
                    className="h-10 w-10 rounded-full border-2 border-slate-200"
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
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-900">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {size.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Publish Status */}
          {isAdmin && (
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Status:</span>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    product.publish
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {product.publish ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TRUST BADGES */}
      <div className="grid grid-cols-3 gap-6 py-8  border-slate-200">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <Check className="text-emerald-600" size={16} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-900">100% original</p>
          <p className="text-xs text-slate-500">Chocolate ice candy cones ice cream toffee caramel halts.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <Check className="text-emerald-600" size={16} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-900">10 days replacement</p>
          <p className="text-xs text-slate-500">Marshmallow biscuit donut drizzle franticide water.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <Check className="text-emerald-600" size={16} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-900">Year warranty</p>
          <p className="text-xs text-slate-500">Cotton candy gingerbread cake i love sugar sweet.</p>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="border-t border-slate-200 pt-8 px-8">
        {/* TAB HEADERS */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 font-semibold text-sm transition ${
              activeTab === "description"
                ? "border-b-2 border-black-500 text-black-500"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 font-semibold text-sm transition ${
              activeTab === "reviews"
                ? "border-b-2 border-black-500 text-black-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "description" && (
          <div className="space-y-8">
            {/* SPECIFICATIONS TABLE */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Specifications
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {product.productCode && (
                      <tr className="border-b border-slate-200">
                        <td className="px-4 py-3 text-sm text-slate-600 bg-slate-50">
                          Category
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {product.category || "N/A"}
                        </td>
                      </tr>
                    )}
                    {product.productSKU && (
                      <tr className="border-b border-slate-200">
                        <td className="px-4 py-3 text-sm text-slate-600 bg-slate-50">
                          Manufacturer
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {product.productSKU}
                        </td>
                      </tr>
                    )}
                    {product.priceIncludesTaxes && (
                      <tr className="border-b border-slate-200">
                        <td className="px-4 py-3 text-sm text-slate-600 bg-slate-50">
                          Warranty
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {product.tax || 0}% Coverage
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-600 bg-slate-50">
                        Serial number
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {product.productCode || "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRODUCT DETAILS */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Product details
              </h3>
              <ul className="space-y-2 px-6 list-disc">
                <li className="text-sm text-slate-700"> The foam workflex feels soft and comfortable</li>
                <li className="text-sm text-slate-700"> Full lids</li>
                <li className="text-sm text-slate-700"> Not intended for use as Personal Protective Equipment</li>
                <li className="text-sm text-slate-700"> Colour: Brown, White-Black-Oxygen Purple/Action Group</li>
                <li className="text-sm text-slate-700"> Style: 821826-109</li>
                <li className="text-sm text-slate-700"> Country/Region of Origin: China</li>
              </ul>
            </div>

            {/* BENEFITS */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Benefits</h3>
              <ul className="space-y-2 list-disc px-6">
                <li className="text-sm text-slate-700"> Mesh and synthetic materials on the upper keep the fluid look of the OG while adding comfortable durability.</li>
                <li className="text-sm text-slate-700"> Originally designed for performance running, the full-length Max Air unit adds soft, comfortable cushioning underfoot.</li>
                <li className="text-sm text-slate-700"> This foam midsole tools springy and soft.</li>
                <li className="text-sm text-slate-700"> The rubber outside adds traction and durability.</li>
              </ul>
            </div>

            {/* DELIVERY AND RETURNS */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Delivery and returns
              </h3>
              <p className="text-sm text-slate-600">
                Your order of $200 or more gets free standard delivery.
              </p>
              <ul className="space-y-2 list-disc px-6">
                <li className="text-sm text-slate-600"> Standard delivered 4-5 Business Days</li>
                <li className="text-sm text-slate-600"> Express delivered 2-4 Business Days</li>
                <li className="text-sm text-slate-600">
                  Orders are processed and delivered Monday-Friday (excluding public holidays)
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* REVIEWS HEADER */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* RATING SUMMARY */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900">Average rating</h4>
                <div className="text-5xl font-bold text-slate-900">
                  {rating.toFixed(1)}/5
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
                <p className="text-xs text-slate-600">
                  ({reviewCount.toLocaleString()} reviews)
                </p>
              </div>

              {/* RATING DISTRIBUTION */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 w-12">
                      {stars} Star
                    </span>
                    <div className="flex-1 h-2 bg-slate-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-800"
                        style={{
                          width: `${ratingDistribution[stars].percent}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 w-12 text-right">
                      {ratingDistribution[stars].count}
                    </span>
                  </div>
                ))}
              </div>

              {/* WRITE REVIEW */}
              <div className="flex justify-end items-start pt-4">
                {!isAdmin && (
                  <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-200">
                    <span>< Pencil />  </span>
                    Write your review
                  </button>
                )}
              </div>
            </div>

            {/* INDIVIDUAL REVIEWS */}
            <div className="space-y-6 border-t border-slate-200 pt-8">
              {reviews.length === 0 ? (
                <p className="text-center text-slate-600">No reviews yet.</p>
              ) : (
                reviews.map((review, idx) => (
                  <div key={review.id} className="space-y-3">
                    {/* Review Header */}
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {review.author}
                            </p>
                            <p className="text-xs text-slate-500">
                              {review.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.verified && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-emerald-500">●</span>
                            <span className="text-xs text-emerald-600">
                              Verified purchase
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-sm text-slate-600">
                      {review.text}
                    </p>

                    {/* Review Footer */}
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-xs text-slate-600 transition hover:text-slate-900">
                        < ThumbsUp /> {review.helpful}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-slate-600 transition hover:text-slate-900">
                        < ThumbsDown /> {review.unhelpful}
                      </button>
                    </div>

                    {/* Divider */}
                    {idx !== reviews.length - 1 && (
                      <div className="border-t border-slate-200 mt-6 pt-6" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}