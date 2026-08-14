import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Fetch all blog categories
export const fetchBlogCategories = createAsyncThunk(
  "blogCategory/fetchBlogCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/blog/categories");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch blog categories"
      );
    }
  }
);

// Create category
export const createBlogCategory = createAsyncThunk(
  "blogCategory/createBlogCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admin/blog/categories", categoryData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create blog category"
      );
    }
  }
);

// Update category
export const updateBlogCategory = createAsyncThunk(
  "blogCategory/updateBlogCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/blog/categories/${id}`, categoryData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update blog category"
      );
    }
  }
);

// Delete category
export const deleteBlogCategory = createAsyncThunk(
  "blogCategory/deleteBlogCategory",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/blog/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete blog category"
      );
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const blogCategorySlice = createSlice({
  name: "blogCategory",
  initialState,
  reducers: {
    clearBlogCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchBlogCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createBlogCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createBlogCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(createBlogCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(updateBlogCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateBlogCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateBlogCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteBlogCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteBlogCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories = state.categories.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteBlogCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBlogCategoryError } = blogCategorySlice.actions;
export default blogCategorySlice.reducer;
