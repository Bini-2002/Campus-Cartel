import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '../../apiConfigure';

interface Group {
  id: string;
  name: string;
  subject: string;
  description: string;
  max_members: number;
  meeting_time: string;
  location: string;
  image?: string;
  members: string[];
}

interface GroupsState {
  items: Group[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch groups
export const fetchGroups = createAsyncThunk('groups/fetchGroups', async () => {
  const response = await axios.get<Group[]>(`${API_BASE_URL}/groups/`);
  return response.data;
});

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    addGroup: (state, action: PayloadAction<Group>) => {
      state.items.push(action.payload);
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((group) => group.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action: PayloadAction<Group[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch groups';
      });
  },
});

export const { addGroup, deleteGroup } = groupsSlice.actions;

export default groupsSlice.reducer;