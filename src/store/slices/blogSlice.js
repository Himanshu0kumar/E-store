import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Public: Fetch published blog posts
export const fetchPublicBlogPosts = createAsyncThunk(
  "blog/fetchPublicBlogPosts",
  async ({ page = 1, limit = 10, category = "All", search = "", tag = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/blog", {
        params: { page, limit, category, search, tag },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch blog posts"
      );
    }
  }
);

// Public: Fetch single post by slug
export const fetchBlogPostBySlug = createAsyncThunk(
  "blog/fetchBlogPostBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/blog/${slug}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch blog post"
      );
    }
  }
);

// Admin: Fetch all posts
export const fetchAdminBlogPosts = createAsyncThunk(
  "blog/fetchAdminBlogPosts",
  async ({ page = 1, limit = 20, status = "all", category = "all", search = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/blog", {
        params: { page, limit, status, category, search },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch admin blog posts"
      );
    }
  }
);

// Admin: Fetch single post by ID
export const fetchBlogPostById = createAsyncThunk(
  "blog/fetchBlogPostById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/blog/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch blog post"
      );
    }
  }
);

// Admin: Create post
export const createBlogPost = createAsyncThunk(
  "blog/createBlogPost",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admin/blog", postData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create blog post"
      );
    }
  }
);

// Admin: Update post
export const updateBlogPost = createAsyncThunk(
  "blog/updateBlogPost",
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/blog/${id}`, postData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update blog post"
      );
    }
  }
);

// Admin: Delete post
export const deleteBlogPost = createAsyncThunk(
  "blog/deleteBlogPost",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/blog/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete blog post"
      );
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  relatedPosts: [],
  popularPosts: [],
  total: 0,
  totalPublished: 0,
  totalDrafts: 0,
  totalViews: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.relatedPosts = [];
      state.popularPosts = [];
    },
    clearBlogError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch public posts
      .addCase(fetchPublicBlogPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicBlogPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPublicBlogPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single post by slug
      .addCase(fetchBlogPostBySlug.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogPostBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentPost = action.payload.post;
        state.relatedPosts = action.payload.relatedPosts || [];
        state.popularPosts = action.payload.popularPosts || [];
      })
      .addCase(fetchBlogPostBySlug.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Fetch admin posts
      .addCase(fetchAdminBlogPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBlogPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.total = action.payload.total;
        state.totalPublished = action.payload.totalPublished;
        state.totalDrafts = action.payload.totalDrafts;
        state.totalViews = action.payload.totalViews;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAdminBlogPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single post by ID (Admin)
      .addCase(fetchBlogPostById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogPostById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchBlogPostById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Create post
      .addCase(createBlogPost.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createBlogPost.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createBlogPost.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update post
      .addCase(updateBlogPost.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateBlogPost.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.posts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(updateBlogPost.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete post
      .addCase(deleteBlogPost.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteBlogPost.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteBlogPost.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPost, clearBlogError } = blogSlice.actions;
export default blogSlice.reducer;
