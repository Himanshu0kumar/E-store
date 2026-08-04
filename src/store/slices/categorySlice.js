import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/lib/axios";



export const getCategories = createAsyncThunk(
  "category/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/categories");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch categories"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (name, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admin/categories", { name });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create category"
      );
    }
  }
);

export const renameCategory = createAsyncThunk(
  "category/renameCategory",
  async ({ categoryId, name }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/categories/${categoryId}`, { name });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to rename category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/categories/${categoryId}`);
      return categoryId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete category"
      );
    }
  }
);

export const addSubcategory = createAsyncThunk(
  "category/addSubcategory",
  async ({ categoryId, name }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/admin/categories/${categoryId}/subcategories`,
        { name }
      );
      return response.data.data; // the updated parent category
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add subcategory"
      );
    }
  }
);

export const renameSubcategory = createAsyncThunk(
  "category/renameSubcategory",
  async ({ categoryId, subcategoryId, name }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/admin/categories/${categoryId}/subcategories/${subcategoryId}`,
        { name }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to rename subcategory"
      );
    }
  }
);

export const deleteSubcategory = createAsyncThunk(
  "category/deleteSubcategory",
  async ({ categoryId, subcategoryId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/api/admin/categories/${categoryId}/subcategories/${subcategoryId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete subcategory"
      );
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

// Small helper — every mutation thunk that succeeds either adds a
// brand-new category, or returns the single updated parent category
// (for renames, subcategory add/rename/delete). This keeps that
// replace-by-id logic in one place instead of six copies.
const replaceCategoryInState = (state, updatedCategory) => {
  const index = state.categories.findIndex((c) => c._id === updatedCategory._id);
  if (index !== -1) {
    state.categories[index] = updatedCategory;
  }
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(renameCategory.fulfilled, (state, action) => {
        replaceCategoryInState(state, action.payload);
      })
      .addCase(renameCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(addSubcategory.fulfilled, (state, action) => {
        replaceCategoryInState(state, action.payload);
      })
      .addCase(addSubcategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(renameSubcategory.fulfilled, (state, action) => {
        replaceCategoryInState(state, action.payload);
      })
      .addCase(renameSubcategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        replaceCategoryInState(state, action.payload);
      })
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.error = action.payload;
      })
  },
});

export default categorySlice.reducer;