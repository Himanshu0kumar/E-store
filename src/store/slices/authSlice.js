import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ========================================
// AXIOS INSTANCE
// ========================================
// withCredentials tells the browser to send/receive httpOnly
// cookies with every request — that's the only "token handling"
// needed now. No interceptor writes/reads localStorage or sets
// an Authorization header; the cookie does that job invisibly.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  withCredentials: true,
});

// ========================================
// RESPONSE INTERCEPTOR — refresh on 401
// ========================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  isRefreshing = false;
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // No body needed — the refresh cookie goes along
        // automatically because of withCredentials.
        await axios.post(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ========================================
// ASYNC THUNKS
// ========================================
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/register", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/login", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/auth/logout", {});
      return null;
    } catch (error) {
      // Even if the API call fails, treat the client as logged out.
      return null;
    }
  }
);

export const getUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/auth/profile");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch profile"
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put("/api/auth/profile", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update profile"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/change-password", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to change password"
      );
    }
  }
);

export const getAddresses = createAsyncThunk(
  "auth/getAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/auth/addresses");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch addresses"
      );
    }
  }
);

export const addAddress = createAsyncThunk(
  "auth/addAddress",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/addresses", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add address"
      );
    }
  }
);

export const updateAddress = createAsyncThunk(
  "auth/updateAddress",
  async ({ addressId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/auth/addresses/${addressId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update address"
      );
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "auth/deleteAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/auth/addresses/${addressId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete address"
      );
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================
const initialState = {
  user: null,
  addresses: [],
  loading: false,
  error: null,
  success: false,
};

// ========================================
// SLICE
// ========================================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.addresses = [];
        state.error = null;
        state.success = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.addresses = [];
      });

    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.addresses = action.payload.addresses || [];
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(getAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.success = true;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.success = true;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.success = true;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = authSlice.actions;
export default authSlice.reducer;