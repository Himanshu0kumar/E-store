import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// 1. Fetch Admin Reviews with Pagination & Filters
export const fetchAdminReviews = createAsyncThunk(
  "reviews/fetchAdminReviews",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/reviews", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch reviews"
      );
    }
  }
);

// 2. Fetch Review Summary Statistics & Breakdown
export const fetchReviewStats = createAsyncThunk(
  "reviews/fetchReviewStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/reviews/stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch review stats"
      );
    }
  }
);

// 3. Update Review Moderation Status
export const updateReviewStatusAction = createAsyncThunk(
  "reviews/updateReviewStatusAction",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/reviews/${id}/status`, {
        status,
      });
      return { id, status, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to update review status"
      );
    }
  }
);

// 4. Admin Reply to Customer Review
export const adminReplyReviewAction = createAsyncThunk(
  "reviews/adminReplyReviewAction",
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/reviews/${id}/reply`, {
        comment,
      });
      return { id, comment, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to post reply"
      );
    }
  }
);

// 5. Toggle Featured / Pin Review
export const toggleFeaturedReviewAction = createAsyncThunk(
  "reviews/toggleFeaturedReviewAction",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/reviews/${id}/feature`);
      return { id, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to toggle featured"
      );
    }
  }
);

// 6. Delete Review
export const deleteReviewAction = createAsyncThunk(
  "reviews/deleteReviewAction",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/admin/reviews/${id}`);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to delete review"
      );
    }
  }
);

// 7. Fetch Storefront Product Reviews
export const fetchProductReviews = createAsyncThunk(
  "reviews/fetchProductReviews",
  async ({ productId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/${productId}/reviews`, {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch product reviews"
      );
    }
  }
);

// 8. Submit Customer Review
export const submitProductReviewAction = createAsyncThunk(
  "reviews/submitProductReviewAction",
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/products/${productId}/reviews`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to submit review"
      );
    }
  }
);

// 9. Check Review Eligibility
export const checkReviewEligibilityAction = createAsyncThunk(
  "reviews/checkReviewEligibilityAction",
  async ({ productId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/products/${productId}/reviews/eligibility`,
        {
          params: { userId },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to check eligibility"
      );
    }
  }
);

// 10. Customer Edit / Update Review
export const updateCustomerReviewAction = createAsyncThunk(
  "reviews/updateCustomerReviewAction",
  async ({ productId, reviewId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/products/${productId}/reviews/${reviewId}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to update review"
      );
    }
  }
);

// 11. Customer Delete Review
export const deleteCustomerReviewAction = createAsyncThunk(
  "reviews/deleteCustomerReviewAction",
  async ({ productId, reviewId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/api/products/${productId}/reviews/${reviewId}`,
        {
          params: { userId },
        }
      );
      return { reviewId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to delete review"
      );
    }
  }
);

const initialState = {
  reviews: [],
  reviewStats: null,
  productReviews: [],
  productReviewStats: null,
  userEligibility: null,
  pagination: {
    totalReviews: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    clearReviewSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Reviews
      .addCase(fetchAdminReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchAdminReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Stats
      .addCase(fetchReviewStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchReviewStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.reviewStats = action.payload;
      })
      .addCase(fetchReviewStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // Update Status
      .addCase(updateReviewStatusAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateReviewStatusAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = `Review status updated to ${action.payload.status}`;
        const updated = action.payload.data;
        if (updated) {
          state.reviews = state.reviews.map((r) =>
            r._id === updated._id ? { ...r, ...updated } : r
          );
        }
      })
      .addCase(updateReviewStatusAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Reply to Review
      .addCase(adminReplyReviewAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(adminReplyReviewAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Merchant reply posted successfully";
        const updated = action.payload.data;
        if (updated) {
          state.reviews = state.reviews.map((r) =>
            r._id === updated._id ? { ...r, ...updated } : r
          );
        }
      })
      .addCase(adminReplyReviewAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Toggle Featured
      .addCase(toggleFeaturedReviewAction.fulfilled, (state, action) => {
        const updated = action.payload.data;
        if (updated) {
          state.reviews = state.reviews.map((r) =>
            r._id === updated._id ? { ...r, ...updated } : r
          );
        }
      })

      // Delete Review
      .addCase(deleteReviewAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteReviewAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Review deleted successfully";
        const deletedId = action.payload.id;
        state.reviews = state.reviews.filter((r) => r._id !== deletedId);
        state.pagination.totalReviews = Math.max(
          0,
          state.pagination.totalReviews - 1
        );
      })
      .addCase(deleteReviewAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Fetch Product Reviews
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.productReviews = action.payload.data || [];
        state.productReviewStats = action.payload.stats || null;
        if (action.payload.eligibility) {
          state.userEligibility = action.payload.eligibility;
        }
      })

      // Submit Review
      .addCase(submitProductReviewAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(submitProductReviewAction.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = "Review submitted successfully!";
      })
      .addCase(submitProductReviewAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Check Review Eligibility
      .addCase(checkReviewEligibilityAction.fulfilled, (state, action) => {
        state.userEligibility = action.payload;
      })

      // Update Customer Review
      .addCase(updateCustomerReviewAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateCustomerReviewAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Review updated successfully!";
        const updated = action.payload.data;
        if (updated) {
          state.productReviews = state.productReviews.map((r) =>
            r._id === updated._id ? { ...r, ...updated } : r
          );
        }
      })
      .addCase(updateCustomerReviewAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete Customer Review
      .addCase(deleteCustomerReviewAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomerReviewAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Review deleted successfully!";
        const deletedId = action.payload.reviewId;
        state.productReviews = state.productReviews.filter(
          (r) => r._id !== deletedId
        );
      })
      .addCase(deleteCustomerReviewAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewError, clearReviewSuccess } = reviewSlice.actions;

export default reviewSlice.reducer;
