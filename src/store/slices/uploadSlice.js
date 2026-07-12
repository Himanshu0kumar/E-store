import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Upload images to Cloudinary via our API route
export const uploadImages = createAsyncThunk(
  "upload/uploadImages",
  async (files, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data.urls; // array of Cloudinary secure URLs
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to upload images"
      );
    }
  }
);

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    urls: [],
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    resetUpload: (state) => {
      state.urls = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadImages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.urls = action.payload;
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer;