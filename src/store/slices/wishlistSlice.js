import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch Wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/wishlist");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch wishlist");
    }
  }
);

// Add to Wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ productId, priority = "medium" }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/wishlist", {
        productId,
        priority,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to add to wishlist");
    }
  }
);

// Remove from Wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/wishlist/${itemId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to remove item");
    }
  }
);

// Check if Product in Wishlist
export const checkWishlist = createAsyncThunk(
  "wishlist/checkWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/wishlist/check/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(false);
    }
  }
);

// Update Wishlist Item Priority
export const updateWishlistPriority = createAsyncThunk(
  "wishlist/updatePriority",
  async ({ itemId, priority }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/wishlist/${itemId}`, { priority });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update priority");
    }
  }
);

// Add Note to Wishlist Item
export const addNoteToWishlist = createAsyncThunk(
  "wishlist/addNote",
  async ({ itemId, note }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/wishlist/${itemId}/note`, { note });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to add note");
    }
  }
);

// Move to Cart
export const moveToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/wishlist/${productId}/move-to-cart`, {
        quantity,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to move to cart");
    }
  }
);

// Clear Wishlist
export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/api/wishlist");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to clear wishlist");
    }
  }
);

const initialState = {
  items: [],
  totalItems: 0,
  totalValue: 0,
  loading: false,
  error: null,
  success: false,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalValue = action.payload.totalValue || 0;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add to Wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.success = true;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove from Wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.success = true;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Check Wishlist
    builder
      .addCase(checkWishlist.fulfilled, (state, action) => {
        state.success = action.payload;
      });

    // Update Priority
    builder
      .addCase(updateWishlistPriority.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWishlistPriority.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.success = true;
      })
      .addCase(updateWishlistPriority.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Note
    builder
      .addCase(addNoteToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNoteToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.success = true;
      })
      .addCase(addNoteToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Move to Cart
    builder
      .addCase(moveToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist?.items || [];
        state.totalItems = action.payload.wishlist?.totalItems || 0;
        state.success = true;
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear Wishlist
    builder
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalValue = 0;
        state.success = true;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = wishlistSlice.actions;
export default wishlistSlice.reducer;