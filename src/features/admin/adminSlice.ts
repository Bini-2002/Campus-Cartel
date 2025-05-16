import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios'; // Simplified import
import API_BASE_URL from '../../apiConfigure'; // Adjust path if apiConfigure is elsewhere

// Define the User type based on your backend response
interface User {
  id: number;
  email: string;
  username: string;
  user_type: string; // e.g., 'student', 'admin'
  // Add other relevant user fields
}

interface AdminState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch all users
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return rejectWithValue('No access token found.');
      }
      const response = await axios.get(`${API_BASE_URL}/users/`, { // Or your admin-specific users endpoint
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data as User[];
    } catch (error: any) {
      if (isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.detail || 'Failed to fetch users.');
      }
      return rejectWithValue('An unknown error occurred while fetching users.');
    }
  }
);

// Async thunk to delete a user
export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return rejectWithValue('No access token found.');
      }
      await axios.delete(`${API_BASE_URL}/users/${userId}/`, { // Or your admin-specific user delete endpoint
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return userId; // Return the id of the deleted user
    } catch (error: any) {
      if (isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.detail || `Failed to delete user ${userId}.`);
      }
      return rejectWithValue(`An unknown error occurred while deleting user ${userId}.`);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch users';
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export default adminSlice.reducer;
function isAxiosError(error: any): error is { response?: any } {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error && error.isAxiosError === true;
}

