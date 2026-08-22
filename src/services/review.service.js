import mongoose from "mongoose";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";

/**
 * Recalculate average rating and total approved review count for a product
 */
export const recalculateProductRating = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) return;

  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avg = stats[0]?.averageRating
    ? Math.round(stats[0].averageRating * 10) / 10
    : 0;
  const count = stats[0]?.reviewCount || 0;

  await Product.findByIdAndUpdate(productId, {
    rating: avg,
    reviewCount: count,
  });

  return { averageRating: avg, reviewCount: count };
};

/**
 * Check if a user is eligible to write/edit a review for a specific product
 * ONLY customers with a DELIVERED order can review.
 */
export const checkUserReviewEligibility = async (productId, userId) => {
  if (!productId || !userId) {
    return {
      canReview: false,
      reason: "Please log in to review this product.",
      existingReview: null,
      isOrdered: false,
      isDelivered: false,
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return {
      canReview: false,
      reason: "Invalid user or product identifier.",
      existingReview: null,
      isOrdered: false,
      isDelivered: false,
    };
  }

  const pObjectId = new mongoose.Types.ObjectId(productId);
  const uObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Check if user already submitted a review
  const existingReview = await Review.findOne({
    product: pObjectId,
    user: uObjectId,
  }).lean();

  // 2. Check if user has an order with status 'delivered' containing this product
  const deliveredOrder = await Order.findOne({
    user: uObjectId,
    $or: [
      { "items.productId": pObjectId },
      { "items.productId": productId },
      { "items.product": pObjectId },
      { "items.product": productId },
    ],
    orderStatus: "delivered",
  }).lean();

  if (deliveredOrder) {
    return {
      canReview: true,
      reason: "You have verified delivered purchases for this item.",
      existingReview,
      isOrdered: true,
      isDelivered: true,
      orderId: deliveredOrder._id,
    };
  }

  // 3. Check if user has any order containing this product (not yet delivered)
  const pendingOrder = await Order.findOne({
    user: uObjectId,
    $or: [
      { "items.productId": pObjectId },
      { "items.productId": productId },
      { "items.product": pObjectId },
      { "items.product": productId },
    ],
  }).sort({ createdAt: -1 }).lean();

  if (pendingOrder) {
    const statusFormatted =
      pendingOrder.orderStatus?.replace("_", " ") || "processing";
    return {
      canReview: false,
      reason: `Your order is currently ${statusFormatted}. You can review this product once it is delivered.`,
      existingReview,
      isOrdered: true,
      isDelivered: false,
      orderStatus: pendingOrder.orderStatus,
    };
  }

  // 4. User has not purchased this product
  return {
    canReview: false,
    reason: "Only verified buyers who have received this product can write a review.",
    existingReview,
    isOrdered: false,
    isDelivered: false,
  };
};

/**
 * Fetch paginated reviews for Admin Dashboard with search and filters
 */
export const getAllReviews = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  rating = "all",
  productId = null,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (status && status !== "all") {
    query.status = status;
  }

  if (rating && rating !== "all") {
    query.rating = parseInt(rating, 10);
  }

  if (productId && mongoose.Types.ObjectId.isValid(productId)) {
    query.product = new mongoose.Types.ObjectId(productId);
  }

  // Search by author name, title, comment, or email
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [
      { userName: regex },
      { userEmail: regex },
      { title: regex },
      { comment: regex },
    ];
  }

  const sort = {};
  const validSortFields = [
    "createdAt",
    "rating",
    "helpfulCount",
    "status",
    "featured",
  ];
  const order = sortOrder === "asc" ? 1 : -1;

  if (validSortFields.includes(sortBy)) {
    sort[sortBy] = order;
  } else {
    sort.createdAt = -1;
  }

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate("product", "name images regularPrice salePrice category")
      .populate("user", "name email avatar")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    reviews,
    pagination: {
      totalReviews: total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

/**
 * Fetch overview analytics and star distribution for admin dashboard
 */
export const getReviewStats = async () => {
  const [
    totalReviews,
    approvedReviews,
    pendingReviews,
    flaggedReviews,
    rejectedReviews,
    verifiedPurchases,
    ratingDistributionAgg,
    avgScoreAgg,
  ] = await Promise.all([
    Review.countDocuments(),
    Review.countDocuments({ status: "approved" }),
    Review.countDocuments({ status: "pending" }),
    Review.countDocuments({ status: "flagged" }),
    Review.countDocuments({ status: "rejected" }),
    Review.countDocuments({ isVerifiedPurchase: true }),
    Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]),
    Review.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
        },
      },
    ]),
  ]);

  const averageRating = avgScoreAgg[0]?.average
    ? Math.round(avgScoreAgg[0].average * 10) / 10
    : 0;

  const distributionMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingDistributionAgg.forEach((item) => {
    if (distributionMap[item._id] !== undefined) {
      distributionMap[item._id] = item.count;
    }
  });

  const ratingBreakdown = {};
  [5, 4, 3, 2, 1].forEach((star) => {
    const count = distributionMap[star] || 0;
    const percent =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    ratingBreakdown[star] = { count, percent };
  });

  const verifiedPercent =
    totalReviews > 0 ? Math.round((verifiedPurchases / totalReviews) * 100) : 0;

  return {
    totalReviews,
    approvedReviews,
    pendingReviews,
    flaggedReviews,
    rejectedReviews,
    verifiedPurchases,
    verifiedPercent,
    averageRating,
    ratingBreakdown,
  };
};

/**
 * Fetch approved reviews for a specific product with breakdown (for storefront)
 */
export const getProductReviews = async (productId, {
  page = 1,
  limit = 10,
  sort = "newest",
  rating = "all",
  userId = null,
} = {}) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query = {
    product: new mongoose.Types.ObjectId(productId),
    status: "approved",
  };

  if (rating && rating !== "all") {
    query.rating = parseInt(rating, 10);
  }

  const sortOptions = {};
  if (sort === "highest") sortOptions.rating = -1;
  else if (sort === "lowest") sortOptions.rating = 1;
  else if (sort === "helpful") sortOptions.helpfulCount = -1;
  else sortOptions.createdAt = -1;

  const [reviews, total, distributionAgg, eligibility] = await Promise.all([
    Review.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments(query),
    Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]),
    userId ? checkUserReviewEligibility(productId, userId) : null,
  ]);

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumScore = 0;
  let totalScoreCount = 0;

  distributionAgg.forEach((item) => {
    if (distribution[item._id] !== undefined) {
      distribution[item._id] = item.count;
      sumScore += item._id * item.count;
      totalScoreCount += item.count;
    }
  });

  const averageRating =
    totalScoreCount > 0 ? Math.round((sumScore / totalScoreCount) * 10) / 10 : 0;

  const breakdown = {};
  [5, 4, 3, 2, 1].forEach((star) => {
    const count = distribution[star] || 0;
    const percent =
      totalScoreCount > 0 ? Math.round((count / totalScoreCount) * 100) : 0;
    breakdown[star] = { count, percent };
  });

  return {
    reviews,
    averageRating,
    totalReviews: totalScoreCount,
    breakdown,
    eligibility: eligibility || { canReview: false, reason: "Log in to review" },
    pagination: {
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

/**
 * Submit a customer review (Enforces that customer has a DELIVERED order)
 */
export const createReview = async ({
  productId,
  userId,
  rating,
  title = "",
  comment,
}) => {
  if (!productId || !userId || !rating || !comment) {
    throw new Error("Product, rating (1-5), and review comment are required");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5 stars");
  }

  const [user, product] = await Promise.all([
    User.findById(userId).lean(),
    Product.findById(productId).lean(),
  ]);

  if (!user) throw new Error("User account not found");
  if (!product) throw new Error("Product not found");

  // Validate that user purchased and order is DELIVERED
  const eligibility = await checkUserReviewEligibility(productId, userId);
  if (!eligibility.canReview) {
    throw new Error(eligibility.reason);
  }

  // Check if user already reviewed this product
  let review = await Review.findOne({ product: productId, user: userId });

  if (review) {
    // Update existing review
    review.rating = rating;
    review.title = title ? title.trim() : "";
    review.comment = comment.trim();
    review.userName = user.name;
    review.userEmail = user.email;
    review.userAvatar = user.avatar || null;
    review.isVerifiedPurchase = true;
    review.status = "approved";
    await review.save();
  } else {
    // Create new review
    review = await Review.create({
      product: productId,
      user: userId,
      order: eligibility.orderId || null,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatar || null,
      rating,
      title: title ? title.trim() : "",
      comment: comment.trim(),
      isVerifiedPurchase: true,
      status: "approved",
    });
  }

  // Recalculate product rating
  await recalculateProductRating(productId);

  return review;
};

/**
 * Customer edit / update their own review
 */
export const updateCustomerReview = async ({
  reviewId,
  userId,
  rating,
  title = "",
  comment,
}) => {
  if (!reviewId || !userId) {
    throw new Error("Review ID and User ID are required");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  // Verify ownership
  if (review.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized: You can only edit your own reviews");
  }

  if (rating !== undefined) {
    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      throw new Error("Rating must be between 1 and 5 stars");
    }
    review.rating = numRating;
  }

  if (title !== undefined) review.title = title.trim();
  if (comment !== undefined) {
    if (!comment.trim()) throw new Error("Comment cannot be empty");
    review.comment = comment.trim();
  }

  await review.save();

  // Recalculate product rating
  await recalculateProductRating(review.product);

  return review;
};

/**
 * Customer delete / remove their own review
 */
export const deleteCustomerReview = async ({ reviewId, userId }) => {
  if (!reviewId || !userId) {
    throw new Error("Review ID and User ID are required");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  // Verify ownership
  if (review.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized: You can only delete your own reviews");
  }

  const productId = review.product;
  await Review.findByIdAndDelete(reviewId);

  // Recalculate product score
  await recalculateProductRating(productId);

  return { success: true, message: "Your review has been removed", id: reviewId };
};

/**
 * Update review moderation status (admin)
 */
export const updateReviewStatus = async (id, status) => {
  const allowed = ["approved", "pending", "rejected", "flagged"];
  if (!allowed.includes(status)) {
    throw new Error("Invalid review status");
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new Error("Review not found");
  }

  review.status = status;
  await review.save();

  // Recalculate product rating average
  await recalculateProductRating(review.product);

  return review;
};

/**
 * Add or update merchant official reply (admin)
 */
export const addAdminReply = async (id, replyComment, adminUserId = null) => {
  if (!replyComment || !replyComment.trim()) {
    throw new Error("Reply comment cannot be empty");
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new Error("Review not found");
  }

  review.adminReply = {
    comment: replyComment.trim(),
    repliedAt: new Date(),
    repliedBy: adminUserId || null,
  };

  await review.save();
  return review;
};

/**
 * Toggle featured / pinned status (admin)
 */
export const toggleReviewFeatured = async (id) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new Error("Review not found");
  }

  review.featured = !review.featured;
  await review.save();
  return review;
};

/**
 * Delete a review permanently (admin)
 */
export const deleteReview = async (id) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new Error("Review not found");
  }

  const productId = review.product;
  await Review.findByIdAndDelete(id);

  // Recalculate product score
  await recalculateProductRating(productId);

  return { success: true, message: "Review deleted successfully", id };
};

/**
 * Vote helpful or unhelpful
 */
export const voteReviewHelpful = async (id, userId, voteType = "up") => {
  const review = await Review.findById(id);
  if (!review) {
    throw new Error("Review not found");
  }

  if (userId) {
    const existingIndex = review.helpfulVotes.findIndex(
      (v) => String(v.user) === String(userId)
    );

    if (existingIndex > -1) {
      const prevVote = review.helpfulVotes[existingIndex].vote;
      if (prevVote === voteType) {
        // Toggle off
        review.helpfulVotes.splice(existingIndex, 1);
        if (voteType === "up") review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        else review.unhelpfulCount = Math.max(0, review.unhelpfulCount - 1);
      } else {
        // Switch vote
        review.helpfulVotes[existingIndex].vote = voteType;
        if (voteType === "up") {
          review.helpfulCount += 1;
          review.unhelpfulCount = Math.max(0, review.unhelpfulCount - 1);
        } else {
          review.unhelpfulCount += 1;
          review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        }
      }
    } else {
      // New vote
      review.helpfulVotes.push({ user: userId, vote: voteType });
      if (voteType === "up") review.helpfulCount += 1;
      else review.unhelpfulCount += 1;
    }
  } else {
    // Anonymous user fallback
    if (voteType === "up") review.helpfulCount += 1;
    else review.unhelpfulCount += 1;
  }

  await review.save();
  return review;
};
