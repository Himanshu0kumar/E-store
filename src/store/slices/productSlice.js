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
      const res = await axios.post("/api/products", productData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create product");
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
    createStatus: "idle", // "idle" | "loading" | "succeeded" | "failed"
  },
  reducers: {},
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
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
      })

      // create product
      .addCase(createProduct.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload); // add new product to the top of the list
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;