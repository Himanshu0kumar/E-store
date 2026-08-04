import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const getBrands = createAsyncThunk(
  "brand/getBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/brands");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch brands"
      );
    }
  }
);

export const createBrand = createAsyncThunk(
  "brand/createBrand",
  async (name, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admin/brands", { name });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create brand"
      );
    }
  }
);

export const renameBrand = createAsyncThunk(
  "brand/renameBrand",
  async ({ brandId, name }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/brands/${brandId}`, { name });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to rename brand"
      );
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "brand/deleteBrand",
  async (brandId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/brands/${brandId}`);
      return brandId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete brand"
      );
    }
  }
);

const initialState = {
  brands: [],
  loading: false,
  error: null,
};

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(getBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.push(action.payload);
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(renameBrand.fulfilled, (state, action) => {
        const index = state.brands.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.brands[index] = action.payload;
      })
      .addCase(renameBrand.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default brandSlice.reducer;