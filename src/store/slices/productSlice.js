import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// GET all products
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async () => {
    const res = await axios.get("/api/products");
    return res.data;
  }
);

// GET single product
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id) => {
    const res = await axios.get(`/api/products/${id}`);
    return res.data;
  }
);

// CREATE product
export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/admin/products", productData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || "Failed to create product"
      );
    }
  }
);

// UPDATE product
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/admin/products/${id}`, productData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || "Failed to update product"
      );
    }
  }
);

// DELETE product
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/admin/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null,
    createStatus: "idle",
    updateStatus: "idle",
    deleteStatus: "idle",
  },
  reducers: {
    clearUpdateStatus: (state) => {
      state.updateStatus = "idle";
      state.error = null;
    },
    clearDeleteStatus: (state) => {
      state.deleteStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // single product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.selectedProduct = null;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch product";
      })

      // create product
      .addCase(createProduct.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })

      // update product
      .addCase(updateProduct.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.selectedProduct = action.payload;
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload;
      })

      // delete product
      .addCase(deleteProduct.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.items = state.items.filter((p) => p._id !== action.payload);
        state.selectedProduct = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearUpdateStatus, clearDeleteStatus } = productSlice.actions;
export default productSlice.reducer;