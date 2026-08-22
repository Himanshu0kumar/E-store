import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Fetch inventory overview with filters & metrics
export const fetchInventoryOverview = createAsyncThunk(
  "inventory/fetchOverview",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/admin/inventory", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch inventory overview"
      );
    }
  }
);

// Update product stock / threshold
export const updateStock = createAsyncThunk(
  "inventory/updateStock",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.patch("/api/admin/inventory", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update stock"
      );
    }
  }
);

// Bulk restock products
export const bulkRestock = createAsyncThunk(
  "inventory/bulkRestock",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/admin/inventory/bulk", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to execute bulk restock"
      );
    }
  }
);

// Fetch inventory audit logs
export const fetchInventoryLogs = createAsyncThunk(
  "inventory/fetchLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/admin/inventory/logs", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch inventory logs"
      );
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    stats: {
      totalProducts: 0,
      totalUnitsInStock: 0,
      inStockCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalValuation: 0,
    },
    items: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    logs: [],
    logsPagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
    loading: false,
    logsLoading: false,
    actionLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
    clearInventorySuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchInventoryOverview
      .addCase(fetchInventoryOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats || state.stats;
        state.items = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchInventoryOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateStock
      .addCase(updateStock.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Stock updated successfully";
        const updated = action.payload.product;
        if (updated) {
          const index = state.items.findIndex(
            (p) => String(p._id) === String(updated._id)
          );
          if (index !== -1) {
            const qty = Number(updated.quantity) || 0;
            const threshold = Number(updated.lowStockThreshold) || 5;
            let stockStatus = "in_stock";
            if (qty === 0) stockStatus = "out_of_stock";
            else if (qty <= threshold) stockStatus = "low_stock";

            state.items[index] = {
              ...state.items[index],
              ...updated,
              stockStatus,
              valuation:
                qty *
                (Number(updated.salePrice) > 0
                  ? Number(updated.salePrice)
                  : Number(updated.regularPrice) || 0),
            };
          }
        }
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // bulkRestock
      .addCase(bulkRestock.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(bulkRestock.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || "Bulk restock completed";
      })
      .addCase(bulkRestock.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // fetchInventoryLogs
      .addCase(fetchInventoryLogs.pending, (state) => {
        state.logsLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logs = action.payload.logs || [];
        state.logsPagination = action.payload.pagination || state.logsPagination;
      })
      .addCase(fetchInventoryLogs.rejected, (state, action) => {
        state.logsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInventoryError, clearInventorySuccess } =
  inventorySlice.actions;
export default inventorySlice.reducer;
