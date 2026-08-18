import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Fetch Cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/cart");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch cart");
    }
  }
);

// Add to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity = 1, selectedColor, selectedSize }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/cart", {
        productId,
        quantity,
        selectedColor,
        selectedSize,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to add to cart");
    }
  }
);

// Update Cart Item Quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/cart/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update cart");
    }
  }
);

// Remove from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/cart/${itemId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to remove item");
    }
  }
);

// Clear Cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/api/cart");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to clear cart");
    }
  }
);

// Apply Coupon
export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async ({ couponCode, discount }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/cart/coupon", {
        couponCode,
        discount,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Invalid coupon");
    }
  }
);

// Update Shipping
export const updateShipping = createAsyncThunk(
  "cart/updateShipping",
  async (shippingCost, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/cart/shipping", {
        shipping: shippingCost,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update shipping");
    }
  }
);

const initialState = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  couponCode: null,
  loading: false,
  error: null,
  success: false,
  itemCount: 0,
};

const cartSlice = createSlice({
  name: "cart",
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
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.tax = action.payload?.tax || 0;
        state.shipping = action.payload?.shipping || 0;
        state.discount = action.payload?.discount || 0;
        state.total = action.payload?.total || 0;
        state.couponCode = action.payload?.couponCode || null;
        state.itemCount = action.payload?.items?.length || state.items.length;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
        state.itemCount = 0;
      });

    // Add to Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const cart = action.payload?.data || action.payload;
        state.items = cart?.items || [];
        state.subtotal = cart?.subtotal || 0;
        state.tax = cart?.tax || 0;
        state.total = cart?.total || 0;
        state.itemCount = cart?.items?.length || state.items.length;
        state.success = true;
        state.lastActionMessage = action.payload?.message || "Item added to cart";
        state.alreadyExists = Boolean(action.payload?.alreadyExists);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Cart Item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        const cart = action.payload?.data || action.payload;
        state.items = cart?.items || [];
        state.subtotal = cart?.subtotal || 0;
        state.tax = cart?.tax || 0;
        state.total = cart?.total || 0;
        state.itemCount = cart?.items?.length || state.items.length;
        state.success = true;
        state.lastActionMessage = action.payload?.message || "Cart updated";
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove from Cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        const cart = action.payload?.data || action.payload;
        state.items = cart?.items || [];
        state.subtotal = cart?.subtotal || 0;
        state.tax = cart?.tax || 0;
        state.total = cart?.total || 0;
        state.itemCount = cart?.items?.length || 0;
        state.success = true;
        state.lastActionMessage = action.payload?.message || "Item removed from cart";
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear Cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.subtotal = 0;
        state.tax = 0;
        state.shipping = 0;
        state.discount = 0;
        state.total = 0;
        state.itemCount = 0;
        state.success = true;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Apply Coupon
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.couponCode = action.payload.couponCode;
        state.discount = action.payload.discount;
        state.total = action.payload.total;
        state.success = true;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Shipping
    builder
      .addCase(updateShipping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShipping.fulfilled, (state, action) => {
        state.loading = false;
        state.shipping = action.payload.shipping;
        state.total = action.payload.total;
        state.success = true;
      })
      .addCase(updateShipping.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear cart on logout
    builder.addCase("auth/logoutUser/fulfilled", (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.shipping = 0;
      state.discount = 0;
      state.total = 0;
      state.couponCode = null;
      state.itemCount = 0;
      state.loading = false;
      state.error = null;
    });
  },
});

export const { clearError, clearSuccess } = cartSlice.actions;
export default cartSlice.reducer;