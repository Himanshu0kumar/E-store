import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Async thunk to fetch real-time dashboard analytics
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/admin/dashboard");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      totalRevenue: 0,
      thisMonthRevenue: 0,
      monthlyGrowth: 0,
      dailyGrowth: 0,
      estimatedProfit: 0,
      totalUnitsSold: 0,
      totalOrdersCount: 0,
      completedOrdersCount: 0,
      pendingOrdersCount: 0,
      cancelledOrdersCount: 0,
      completionRate: 0,
      allProductsCount: 0,
      allUsersCount: 0,
      lowStockCount: 0,
    },
    featuredProduct: null,
    genderBreakdown: {
      men: 0,
      women: 0,
      kids: 0,
      total: 0,
      menPercent: 45,
      womenPercent: 35,
      kidsPercent: 20,
    },
    chartMonths: [],
    allMonths: [],
    last24Hours: [],
    recentOrders: [],
    lowStockProducts: [],
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        // keep old data while refreshing to avoid flickering
        if (!state.lastUpdated) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats || state.stats;
        state.featuredProduct = action.payload.featuredProduct || state.featuredProduct;
        state.genderBreakdown = action.payload.genderBreakdown || state.genderBreakdown;
        state.chartMonths = action.payload.chartMonths || state.chartMonths;
        state.allMonths = action.payload.allMonths || state.allMonths;
        state.last24Hours = action.payload.last24Hours || state.last24Hours;
        state.recentOrders = action.payload.recentOrders || state.recentOrders;
        state.lowStockProducts = action.payload.lowStockProducts || state.lowStockProducts;
        state.lastUpdated = action.payload.timestamp || new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
