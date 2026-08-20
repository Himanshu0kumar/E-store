import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// 1. Fetch User Orders (History)
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/orders", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch orders"
      );
    }
  }
);

// 2. Fetch Admin Orders (All Orders)
export const fetchAdminOrders = createAsyncThunk(
  "orders/fetchAdminOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/orders", {
        params: { ...params, admin: "true" },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch orders"
      );
    }
  }
);

// 3. Fetch Single Order by ID
export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch order details"
      );
    }
  }
);

// 4. Create New Order (Checkout)
export const createNewOrder = createAsyncThunk(
  "orders/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/orders", orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to place order"
      );
    }
  }
);

// 5. Update Order Status (Admin)
export const updateOrderStatusAction = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/orders/${orderId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to update order"
      );
    }
  }
);

// 6. Cancel Order (User or Admin)
export const cancelOrderAction = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/cancel`, { reason });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to cancel order"
      );
    }
  }
);

// 7. Fetch Order Stats (Admin)
export const fetchOrderStatsAction = createAsyncThunk(
  "orders/fetchOrderStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/orders/stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch order stats"
      );
    }
  }
);

// 8. Delete Order (Admin)
export const deleteOrderAction = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/orders/${orderId}`);
      return orderId;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to delete order"
      );
    }
  }
);

const initialState = {
  userOrders: [],
  adminOrders: [],
  selectedOrder: null,
  stats: {
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearOrderSuccess: (state) => {
      state.successMessage = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch User Orders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload?.orders || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userOrders = [];
      });

    // 2. Fetch Admin Orders
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.adminOrders = action.payload?.orders || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.adminOrders = [];
      });

    // 3. Fetch Single Order Details
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });

    // 4. Create Order
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedOrder = action.payload.data;
        state.successMessage = "Order placed successfully!";
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // 5. Update Order Status
    builder
      .addCase(updateOrderStatusAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        state.selectedOrder = updated;
        state.adminOrders = state.adminOrders.map((o) =>
          o._id === updated._id ? updated : o
        );
        state.userOrders = state.userOrders.map((o) =>
          o._id === updated._id ? updated : o
        );
        state.successMessage = "Order status updated successfully!";
      })
      .addCase(updateOrderStatusAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // 6. Cancel Order
    builder
      .addCase(cancelOrderAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelOrderAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        if (state.selectedOrder?._id === updated._id) {
          state.selectedOrder = updated;
        }
        state.userOrders = state.userOrders.map((o) =>
          o._id === updated._id ? updated : o
        );
        state.adminOrders = state.adminOrders.map((o) =>
          o._id === updated._id ? updated : o
        );
        state.successMessage = "Order has been cancelled.";
      })
      .addCase(cancelOrderAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // 7. Order Stats
    builder
      .addCase(fetchOrderStatsAction.fulfilled, (state, action) => {
        state.stats = action.payload || state.stats;
      });

    // 8. Delete Order
    builder
      .addCase(deleteOrderAction.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.adminOrders = state.adminOrders.filter((o) => o._id !== deletedId);
      });
  },
});

export const { clearOrderError, clearOrderSuccess, clearSelectedOrder } =
  orderSlice.actions;

export default orderSlice.reducer;
