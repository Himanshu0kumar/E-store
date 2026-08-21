import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// 1. Fetch Users List with Pagination & Filters
export const fetchAdminUsers = createAsyncThunk(
  "users/fetchAdminUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/users", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch users"
      );
    }
  }
);

// 2. Fetch User Aggregate Stats
export const fetchUserStats = createAsyncThunk(
  "users/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/users/stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch stats"
      );
    }
  }
);

// 3. Fetch Single User Details (Customer 360)
export const fetchUserDetails = createAsyncThunk(
  "users/fetchUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch user details"
      );
    }
  }
);

// 4. Create New User
export const createUserAction = createAsyncThunk(
  "users/createUserAction",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admin/users", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to create user"
      );
    }
  }
);

// 5. Update User Profile & Info
export const updateUserAction = createAsyncThunk(
  "users/updateUserAction",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to update user"
      );
    }
  }
);

// 6. Delete User Account
export const deleteUserAction = createAsyncThunk(
  "users/deleteUserAction",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return { ...response.data, id: userId };
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to delete user"
      );
    }
  }
);

// 7. Quick Role Update
export const updateUserRoleAction = createAsyncThunk(
  "users/updateUserRoleAction",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/users/${id}/role`, { role });
      return { id, role, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to update role"
      );
    }
  }
);

// 8. Quick Status Update
export const updateUserStatusAction = createAsyncThunk(
  "users/updateUserStatusAction",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/users/${id}/status`, { status });
      return { id, status, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to update status"
      );
    }
  }
);

// 9. Fetch Dynamic Role Permissions
export const fetchRolePermissions = createAsyncThunk(
  "users/fetchRolePermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/permissions");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to fetch permissions"
      );
    }
  }
);

// 10. Update Role Permissions
export const updateRolePermissionsAction = createAsyncThunk(
  "users/updateRolePermissionsAction",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.put("/api/admin/permissions", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to update role permissions"
      );
    }
  }
);

// 11. Reset Role Permissions to Factory Defaults
export const resetRolePermissionsAction = createAsyncThunk(
  "users/resetRolePermissionsAction",
  async (role = null, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admin/permissions/reset", { role });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to reset permissions"
      );
    }
  }
);

const initialState = {
  users: [],
  userStats: null,
  selectedUser: null,
  rolePermissions: [],
  pagination: {
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  statsLoading: false,
  actionLoading: false,
  permissionsLoading: false,
  error: null,
  successMessage: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.successMessage = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // Fetch Single User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUserAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createUserAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "User created successfully";
        if (action.payload.data) {
          state.users.unshift(action.payload.data);
          state.pagination.totalUsers += 1;
        }
      })
      .addCase(createUserAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUserAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateUserAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "User updated successfully";
        const updated = action.payload.data;
        if (updated) {
          state.users = state.users.map((u) =>
            u._id === updated._id ? { ...u, ...updated } : u
          );
          if (state.selectedUser?._id === updated._id) {
            state.selectedUser = { ...state.selectedUser, ...updated };
          }
        }
      })
      .addCase(updateUserAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUserAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteUserAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "User deleted successfully";
        const deletedId = action.payload.id;
        state.users = state.users.filter((u) => u._id !== deletedId);
        state.pagination.totalUsers = Math.max(0, state.pagination.totalUsers - 1);
        if (state.selectedUser?._id === deletedId) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUserAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update Role
      .addCase(updateUserRoleAction.fulfilled, (state, action) => {
        const { id, role } = action.payload;
        state.users = state.users.map((u) => (u._id === id ? { ...u, role } : u));
        if (state.selectedUser?._id === id) {
          state.selectedUser.role = role;
        }
      })

      // Update Status
      .addCase(updateUserStatusAction.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        state.users = state.users.map((u) => (u._id === id ? { ...u, status } : u));
        if (state.selectedUser?._id === id) {
          state.selectedUser.status = status;
        }
      })

      // Fetch Role Permissions
      .addCase(fetchRolePermissions.pending, (state) => {
        state.permissionsLoading = true;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.rolePermissions = action.payload || [];
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.error = action.payload;
      })

      // Update Role Permissions
      .addCase(updateRolePermissionsAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateRolePermissionsAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || "Permissions updated successfully";
        const updated = action.payload.data;
        if (updated) {
          state.rolePermissions = state.rolePermissions.map((rp) =>
            rp.role === updated.role ? updated : rp
          );
        }
      })
      .addCase(updateRolePermissionsAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Reset Role Permissions
      .addCase(resetRolePermissionsAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(resetRolePermissionsAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || "Permissions reset to default";
        if (Array.isArray(action.payload.data)) {
          state.rolePermissions = action.payload.data;
        } else if (action.payload.data) {
          const updated = action.payload.data;
          state.rolePermissions = state.rolePermissions.map((rp) =>
            rp.role === updated.role ? updated : rp
          );
        }
      })
      .addCase(resetRolePermissionsAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, clearUserSuccess, clearSelectedUser } =
  userSlice.actions;

export default userSlice.reducer;
