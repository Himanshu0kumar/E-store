"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Check,
  MessageSquare,
  ThumbsUp,
  Pencil,
  ShieldCheck,
  Sparkles,
  Send,
  X,
  RefreshCw,
  AlertCircle,
  Trash2,
  Lock,
  PackageCheck,
  Clock,
  Info,
} from "lucide-react";

import {
  fetchProductReviews,
  submitProductReviewAction,
  updateCustomerReviewAction,
  deleteCustomerReviewAction,
  checkReviewEligibilityAction,
} from "@/store/slices/reviewSlice";
import { openAuthModal } from "@/store/slices/authSlice";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import Toast from "@/components/ui/Toast";

export default function ProductDetailsView({ product, isAdmin = false }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("description");

  const { user } = useSelector((state) => state.auth || {});
  const currentUser = user?.user || user;
  const currentUserId = currentUser?._id || currentUser?.id;

  const {
    productReviews = [],
    productReviewStats,
    userEligibility,
    actionLoading,
  } = useSelector((state) => state.reviews || {});

  // Write / Edit Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [titleInput, setTitleInput] = useState("");
  const [commentInput, setCommentInput] = useState("");

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState(null);

  const [toast, setToast] = useState({ message: "", type: "success" });

  const productId = product?._id || product?.id;

  // Load reviews & check eligibility
  const loadProductFeedback = () => {
    if (productId) {
      dispatch(
        fetchProductReviews({
          productId,
          params: currentUserId ? { userId: currentUserId } : {},
        })
      );
      if (currentUserId) {
        dispatch(
          checkReviewEligibilityAction({
            productId,
            userId: currentUserId,
          })
        );
      }
    }
  };

  useEffect(() => {
    loadProductFeedback();
  }, [productId, currentUserId, dispatch]);

  // Find if current user has an existing review
  const myReview = useMemo(() => {
    if (!currentUserId || !productReviews.length) return null;
    return productReviews.find(
      (r) =>
        r.user === currentUserId ||
        r.user?._id === currentUserId ||
        r.userEmail === currentUser?.email
    );
  }, [productReviews, currentUserId, currentUser]);

  if (!product) return null;

  const avgRating =
    productReviewStats?.averageRating || product.rating || 5.0;
  const reviewCount =
    productReviewStats?.totalReviews || productReviews.length || 0;

  const breakdown = productReviewStats?.breakdown || {
    5: { count: 0, percent: 100 },
    4: { count: 0, percent: 0 },
    3: { count: 0, percent: 0 },
    2: { count: 0, percent: 0 },
    1: { count: 0, percent: 0 },
  };

  // Open modal to write a brand new review
  const handleOpenWriteModal = () => {
    if (!currentUser) {
      dispatch(openAuthModal({ mode: "login" }));
      return;
    }
    if (!userEligibility?.canReview && !myReview) {
      setToast({
        message:
          userEligibility?.reason ||
          "Only verified customers with a delivered order can review this product.",
        type: "info",
      });
      return;
    }

    setIsEditing(false);
    setEditingReviewId(null);
    setRatingInput(5);
    setTitleInput("");
    setCommentInput("");
    setReviewModalOpen(true);
  };

  // Open modal to edit existing review
  const handleOpenEditModal = (review) => {
    setIsEditing(true);
    setEditingReviewId(review._id);
    setRatingInput(review.rating || 5);
    setTitleInput(review.title || "");
    setCommentInput(review.comment || "");
    setReviewModalOpen(true);
  };

  // Submit or update review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      setToast({ message: "Please enter your review comment", type: "error" });
      return;
    }

    if (isEditing && editingReviewId) {
      // Edit existing review
      const res = await dispatch(
        updateCustomerReviewAction({
          productId,
          reviewId: editingReviewId,
          data: {
            userId: currentUserId,
            rating: ratingInput,
            title: titleInput.trim(),
            comment: commentInput.trim(),
          },
        })
      );

      if (!res.error) {
        setReviewModalOpen(false);
        setToast({
          message: "Your review has been updated successfully!",
          type: "success",
        });
        loadProductFeedback();
      } else {
        setToast({
          message: res.payload || "Failed to update review",
          type: "error",
        });
      }
    } else {
      // Create new review
      const res = await dispatch(
        submitProductReviewAction({
          productId,
          data: {
            userId: currentUserId,
            rating: ratingInput,
            title: titleInput.trim(),
            comment: commentInput.trim(),
          },
        })
      );

      if (!res.error) {
        setReviewModalOpen(false);
        setTitleInput("");
        setCommentInput("");
        setRatingInput(5);
        setToast({
          message: "Thank you! Your review has been submitted.",
          type: "success",
        });
        loadProductFeedback();
      } else {
        setToast({
          message: res.payload || "Failed to submit review",
          type: "error",
        });
      }
    }
  };

  // Delete review
  const handleDeleteClick = (reviewId) => {
    setReviewToDeleteId(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (reviewToDeleteId && currentUserId) {
      const res = await dispatch(
        deleteCustomerReviewAction({
          productId,
          reviewId: reviewToDeleteId,
          userId: currentUserId,
        })
      );
      setDeleteDialogOpen(false);
      setReviewToDeleteId(null);

      if (!res.error) {
        setToast({
          message: "Your review has been deleted.",
          type: "success",
        });
        loadProductFeedback();
      } else {
        setToast({
          message: res.payload || "Failed to delete review",
          type: "error",
        });
      }
    }
  };

  // Helpful vote
  const handleHelpfulVote = async (reviewId) => {
    try {
      await fetch(`/api/products/${productId}/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId || null,
          vote: "up",
        }),
      });
      loadProductFeedback();
      setToast({ message: "Thanks for your feedback!", type: "success" });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* TABS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
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
            className={`pb-3 font-bold text-sm transition whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Ratings & Customer Reviews</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 font-semibold">
              {reviewCount}
            </span>
          </button>
        </div>

        {/* TAB 1: DESCRIPTION & SPECIFICATIONS */}
        {activeTab === "description" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8 text-slate-700"
          >
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
                        <td className="px-4 py-3 font-semibold text-slate-900 font-mono">
                          {product.productCode}
                        </td>
                      </tr>
                    )}
                    {product.productSKU && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500 bg-slate-50 font-medium w-1/3">
                          SKU
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 font-mono">
                          {product.productSKU}
                        </td>
                      </tr>
                    )}
                    {product.tags && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500 bg-slate-50 font-medium w-1/3">
                          Tags
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {product.tags}
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
                Detailed Description
              </h3>
              <div
                className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description ||
                    "<p>No detailed description provided for this product.</p>",
                }}
              />
            </div>
          </motion.div>
        )}

        {/* TAB 2: RATINGS & CUSTOMER REVIEWS */}
        {activeTab === "reviews" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* REVIEWS SUMMARY HEADER */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* RATING SUMMARY */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall Rating
                </h4>
                <div className="text-4xl font-black text-slate-900 font-mono">
                  {avgRating.toFixed(1)} / 5.0
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i <= Math.round(avgRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Based on{" "}
                  <strong className="text-slate-800 font-bold">
                    {reviewCount.toLocaleString()}
                  </strong>{" "}
                  verified customer ratings
                </p>
              </div>

              {/* RATING DISTRIBUTION PROGRESS BARS */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const item = breakdown[stars] || { count: 0, percent: 0 };
                  return (
                    <div
                      key={stars}
                      className="flex items-center gap-3 text-xs"
                    >
                      <span className="font-medium text-slate-700 w-12">
                        {stars} Star
                      </span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percent}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            stars >= 4
                              ? "bg-emerald-500"
                              : stars === 3
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                      </div>
                      <span className="text-slate-500 w-12 text-right font-mono text-[11px]">
                        {item.percent}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* WRITE OR EDIT REVIEW CTA */}
              <div className="flex flex-col justify-start lg:justify-end items-start gap-2 pt-2">
                {!isAdmin && (
                  <>
                    {myReview ? (
                      /* USER HAS ALREADY REVIEWED: SHOW EDIT BUTTON */
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 w-full space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            You reviewed this product
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOpenEditModal(myReview)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit Review
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDeleteClick(myReview._id)}
                            className="flex items-center gap-1.5 rounded-xl bg-white border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    ) : userEligibility?.canReview ? (
                      /* ELIGIBLE WITH DELIVERED PURCHASE: SHOW WRITE BUTTON */
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleOpenWriteModal}
                        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-teal-700"
                      >
                        <Pencil className="w-4 h-4" />
                        Write a Review
                      </motion.button>
                    ) : (
                      /* NOT ELIGIBLE / NOT DELIVERED YET */
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 w-full">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                          Verified Buyer Reviews Only
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {!currentUser
                            ? "Please sign in with your purchase account to review this product."
                            : userEligibility?.reason ||
                              "Only customers who have purchased and received this product can write a review."}
                        </p>
                        {!currentUser && (
                          <button
                            onClick={() =>
                              dispatch(openAuthModal({ mode: "login" }))
                            }
                            className="text-emerald-600 font-bold hover:underline text-[11px] pt-1 block"
                          >
                            Sign in to review &rarr;
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* REVIEWS LIST */}
            <div className="space-y-6 border-t border-slate-100 pt-6">
              {productReviews.length === 0 ? (
                <div className="py-12 text-center">
                  <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">
                    No reviews yet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Verified customers who have received this product will share their experience here.
                  </p>
                </div>
              ) : (
                productReviews.map((review, idx) => {
                  const isAuthor =
                    currentUserId &&
                    (review.user === currentUserId ||
                      review.user?._id === currentUserId ||
                      review.userEmail === currentUser?.email);

                  return (
                    <motion.div
                      key={review._id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className={`space-y-2.5 pb-6 border-b border-slate-100 last:border-b-0 ${
                        isAuthor
                          ? "p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {review.userAvatar ? (
                            <img
                              src={review.userAvatar}
                              alt={review.userName}
                              className="h-9 w-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                              {review.userName?.[0] || "U"}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-xs text-slate-900">
                                {review.userName}
                              </p>
                              {isAuthor && (
                                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Your Review
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Self edit/delete buttons for author */}
                          {isAuthor && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => handleOpenEditModal(review)}
                                className="p-1 text-slate-400 hover:text-emerald-600 transition"
                                title="Edit your review"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(review._id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                title="Delete your review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {review.title && (
                        <h4 className="text-xs font-bold text-slate-900">
                          {review.title}
                        </h4>
                      )}

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Merchant Reply if present */}
                      {review.adminReply?.comment && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 mt-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            Merchant Response
                          </span>
                          <p className="text-slate-600">
                            {review.adminReply.comment}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        {review.isVerifiedPurchase && (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Verified Delivered Buyer
                          </span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleHelpfulVote(review._id)}
                          className="flex items-center gap-1 hover:text-slate-700 transition"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />{" "}
                          {review.helpfulCount || 0} Helpful
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* CUSTOMER REVIEW WRITE / EDIT MODAL */}
      <AnimatePresence>
        {reviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                    <Star className="w-5 h-5 fill-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {isEditing ? "Edit Your Review" : "Write a Product Review"}
                    </h3>
                    <p className="text-xs text-slate-400">{product.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star Rating Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive =
                        (hoverRating || ratingInput) >= star;
                      return (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRatingInput(star)}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isActive
                                ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                                : "text-slate-200 hover:text-slate-300"
                            }`}
                          />
                        </motion.button>
                      );
                    })}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {hoverRating || ratingInput} Star
                      {(hoverRating || ratingInput) > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Review Headline */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Great quality, fits perfectly!"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Review <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="What did you like or dislike about this product? How was the fit and material?"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {isEditing ? "Update Review" : "Submit Review"}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOMER DELETE REVIEW DIALOG */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Your Review?"
        description="Are you sure you want to delete your review? This action will remove your rating and feedback permanently."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setReviewToDeleteId(null);
        }}
        isLoading={actionLoading}
      />
    </div>
  );
}