"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  ThumbsUp,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Send,
  X,
  SlidersHorizontal,
  Eye,
  Check,
} from "lucide-react";

import {
  fetchAdminReviews,
  fetchReviewStats,
  updateReviewStatusAction,
  adminReplyReviewAction,
  toggleFeaturedReviewAction,
  deleteReviewAction,
  clearReviewError,
  clearReviewSuccess,
} from "@/store/slices/reviewSlice";

import Pagination from "@/components/common/Pagination";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import Toast from "@/components/ui/Toast";

export default function ReviewsManagementPage() {
  const dispatch = useDispatch();
  const {
    reviews = [],
    reviewStats,
    pagination,
    loading,
    statsLoading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.reviews || {});

  // Controls & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all"); // "all", "pending", "approved", "flagged", "rejected"
  const [ratingFilter, setRatingFilter] = useState("all"); // "all", "5", "4", "3", "2", "1"
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Active Review
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReviewForReply, setActiveReviewForReply] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const [toast, setToast] = useState({ message: "", type: "success" });

  const limit = 10;

  const loadData = () => {
    dispatch(
      fetchAdminReviews({
        page: currentPage,
        limit,
        search: searchQuery,
        status: statusTab,
        rating: ratingFilter,
        sortBy,
        sortOrder,
      })
    );
  };

  useEffect(() => {
    loadData();
  }, [
    dispatch,
    currentPage,
    searchQuery,
    statusTab,
    ratingFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    dispatch(fetchReviewStats());
  }, [dispatch]);

  // Notifications
  useEffect(() => {
    if (successMessage) {
      setToast({ message: successMessage, type: "success" });
      dispatch(clearReviewSuccess());
      dispatch(fetchReviewStats());
    }
    if (error) {
      setToast({ message: error, type: "error" });
      dispatch(clearReviewError());
    }
  }, [successMessage, error, dispatch]);

  // Moderation Handlers
  const handleStatusChange = async (id, newStatus) => {
    await dispatch(updateReviewStatusAction({ id, status: newStatus }));
    loadData();
  };

  const handleToggleFeatured = async (id) => {
    await dispatch(toggleFeaturedReviewAction(id));
    loadData();
  };

  // Reply submission
  const handleOpenReplyModal = (review) => {
    setActiveReviewForReply(review);
    setReplyText(review.adminReply?.comment || "");
    setReplyModalOpen(true);
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    if (activeReviewForReply?._id) {
      await dispatch(
        adminReplyReviewAction({
          id: activeReviewForReply._id,
          comment: replyText.trim(),
        })
      );
      setReplyModalOpen(false);
      setActiveReviewForReply(null);
      setReplyText("");
      loadData();
    }
  };

  // Delete handlers
  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (reviewToDelete?._id) {
      await dispatch(deleteReviewAction(reviewToDelete._id));
      setDeleteModalOpen(false);
      setReviewToDelete(null);
      loadData();
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusTab("all");
    setRatingFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Helpers
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
      case "flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            Flagged / Reported
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const breakdown = reviewStats?.ratingBreakdown || {
    5: { count: 0, percent: 0 },
    4: { count: 0, percent: 0 },
    3: { count: 0, percent: 0 },
    2: { count: 0, percent: 0 },
    1: { count: 0, percent: 0 },
  };

  return (
    <div className="space-y-6 pb-16">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
              Feedback
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-semibold text-emerald-600">
              Customer Reviews
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            Review & Rating Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Moderate customer feedback, reply to merchant reviews, check verified purchases, and monitor product sentiment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadData();
              dispatch(fetchReviewStats());
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ANALYTICS & RATING BREAKDOWN HERO BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overall Score Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Store Average Rating
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                {statsLoading ? "..." : (reviewStats?.averageRating || 5.0).toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 5.0</span>
            </div>

            <div className="flex items-center gap-1 text-amber-400 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-5 h-5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Based on{" "}
              <strong className="text-slate-800 font-bold">
                {statsLoading ? "..." : (reviewStats?.totalReviews || 0).toLocaleString()}
              </strong>{" "}
              total customer reviews across all products.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Verified Buyers:{" "}
              <strong className="text-emerald-700">
                {reviewStats?.verifiedPercent || 0}%
              </strong>
            </span>
            <span className="text-slate-500">
              Pending:{" "}
              <strong className="text-amber-700">
                {reviewStats?.pendingReviews || 0}
              </strong>
            </span>
          </div>
        </motion.div>

        {/* Rating Breakdown Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              Rating Score Breakdown
            </h2>
            <span className="text-xs text-slate-400">
              Click any bar to filter reviews
            </span>
          </div>

          <div className="space-y-2.5 my-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const item = breakdown[star] || { count: 0, percent: 0 };
              const isFilterActive = ratingFilter === String(star);

              return (
                <div
                  key={star}
                  onClick={() => {
                    setRatingFilter(isFilterActive ? "all" : String(star));
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-3 p-1.5 rounded-xl cursor-pointer transition ${
                    isFilterActive ? "bg-amber-50/80 font-bold" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1 w-12 shrink-0 text-xs font-bold text-slate-700">
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        star >= 4
                          ? "bg-emerald-500"
                          : star === 3
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                  </div>

                  <span className="w-14 text-right text-xs font-mono font-semibold text-slate-600 shrink-0">
                    {item.percent}% ({item.count})
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing filter:{" "}
              <strong className="text-slate-800 capitalize">
                {ratingFilter === "all" ? "All Star Ratings" : `${ratingFilter} Stars`}
              </strong>
            </span>
            {ratingFilter !== "all" && (
              <button
                onClick={() => setRatingFilter("all")}
                className="text-emerald-600 font-bold hover:underline"
              >
                Clear star filter
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* STATUS TABS & CONTROL BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
        {/* Status navigation tabs */}
        <div className="flex items-center border-b border-slate-100 pb-3 gap-2 overflow-x-auto">
          {[
            { id: "all", label: "All Feedback", count: reviewStats?.totalReviews },
            {
              id: "pending",
              label: "Pending Moderation",
              count: reviewStats?.pendingReviews,
              badge: "bg-amber-100 text-amber-800",
            },
            {
              id: "approved",
              label: "Approved Reviews",
              count: reviewStats?.approvedReviews,
              badge: "bg-emerald-100 text-emerald-800",
            },
            {
              id: "flagged",
              label: "Flagged / Reported",
              count: reviewStats?.flaggedReviews,
              badge: "bg-orange-100 text-orange-800",
            },
            {
              id: "rejected",
              label: "Rejected",
              count: reviewStats?.rejectedReviews,
              badge: "bg-rose-100 text-rose-800",
            },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.badge || "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, review comment, or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★</option>
              <option value="3">3 Stars ★★★</option>
              <option value="2">2 Stars ★★</option>
              <option value="1">1 Star ★</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="createdAt-desc">Newest Feedback</option>
              <option value="createdAt-asc">Oldest Feedback</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
              <option value="helpfulCount-desc">Most Helpful</option>
            </select>

            {(searchQuery || statusTab !== "all" || ratingFilter !== "all") && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REVIEWS LIST */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            Loading Customer Feedback...
          </h3>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No reviews found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            There are no reviews matching your current filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
                review.featured
                  ? "border-amber-300 ring-1 ring-amber-300/40 bg-gradient-to-r from-amber-50/20 to-white"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left side: Product + Customer + Rating + Comment */}
                <div className="flex-1 space-y-3">
                  {/* Top row: Product Tag + Status + Rating + Featured */}
                  <div className="flex items-center flex-wrap gap-2.5">
                    {renderStars(review.rating)}
                    <span className="text-xs font-bold text-slate-800">
                      {review.rating}.0
                    </span>

                    <span className="text-slate-300">&middot;</span>
                    {getStatusBadge(review.status)}

                    {review.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Featured
                      </span>
                    )}

                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  {/* Review Title & Comment */}
                  <div>
                    {review.title && (
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        {review.title}
                      </h4>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>

                  {/* Customer author + Product info info strip */}
                  <div className="flex items-center flex-wrap gap-4 pt-2 border-t border-slate-100 text-xs">
                    {/* Customer */}
                    <div className="flex items-center gap-2">
                      {review.userAvatar ? (
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                          {review.userName?.[0] || "U"}
                        </div>
                      )}
                      <span className="font-bold text-slate-800">
                        {review.userName}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({review.userEmail || "customer"})
                      </span>
                    </div>

                    <span className="text-slate-300">&middot;</span>

                    {/* Product */}
                    {review.product && (
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                        <Link
                          href={`/dashboard/products/${review.product._id}`}
                          className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          {review.product.name}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    <span className="text-slate-300">&middot;</span>

                    {/* Date */}
                    <span className="text-slate-400 text-[11px]">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    {/* Helpful count */}
                    {(review.helpfulCount > 0 || review.unhelpfulCount > 0) && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <ThumbsUp className="w-3 h-3 text-slate-400" />
                        {review.helpfulCount} helpful
                      </span>
                    )}
                  </div>

                  {/* Merchant Official Reply (if any) */}
                  {review.adminReply?.comment && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          Merchant Response
                        </span>
                        {review.adminReply.repliedAt && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(
                              review.adminReply.repliedAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {review.adminReply.comment}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side: Action Moderation Buttons */}
                <div className="flex lg:flex-col items-center lg:items-end gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Approve */}
                  {review.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(review._id, "approved")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition"
                      title="Approve Review"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Approve
                    </button>
                  )}

                  {/* Reject */}
                  {review.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(review._id, "rejected")}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1 transition"
                      title="Reject Review"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Reject
                    </button>
                  )}

                  {/* Flag */}
                  {review.status !== "flagged" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(review._id, "flagged")}
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition"
                      title="Flag as Suspicious / Spam"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  )}

                  {/* Feature / Pin */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(review._id)}
                    className={`p-1.5 rounded-xl border transition ${
                      review.featured
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                    }`}
                    title={review.featured ? "Unpin Review" : "Pin Review to Top"}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  {/* Reply */}
                  <button
                    type="button"
                    onClick={() => handleOpenReplyModal(review)}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    title="Write Merchant Reply"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(review)}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
          <p className="text-xs text-slate-500">
            Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
            <strong className="text-slate-800">{pagination.totalPages}</strong>
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* MERCHANT REPLY MODAL */}
      <AnimatePresence>
        {replyModalOpen && (
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
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Merchant Official Reply
                    </h3>
                    <p className="text-xs text-slate-500">
                      Responding to {activeReviewForReply?.userName}&apos;s review
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer review snippet */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">
                  {activeReviewForReply?.title || "Review:"}
                </span>
                <p className="text-slate-600 italic">
                  &ldquo;{activeReviewForReply?.comment}&rdquo;
                </p>
              </div>

              <form onSubmit={handleSaveReply} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Response
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank the customer or provide support resolution..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {actionLoading ? "Posting..." : "Post Official Reply"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Customer Review?"
        description={`Are you sure you want to permanently delete the review by "${reviewToDelete?.userName}"? This will recalculate the product rating average.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        isLoading={actionLoading}
      />
    </div>
  );
}
