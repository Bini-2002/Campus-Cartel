import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '../../apiConfigure';

export interface Post {
  id: number;
  content: string;
  like_count: number;
  comment_count: number;
  liked: boolean;
  author?: number;
  author_name?: string;
  created_at?: string;
  image?: string;
}

interface PostsState {
  items: Post[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Fetch posts
export const fetchPosts = createAsyncThunk<Post[]>('posts/fetchPosts', async () => {
  const response = await axios.get<Post[]>(`${API_BASE_URL}/posts/`);
  return response.data;
});

// Update post
export const updatePost = createAsyncThunk<Post, { id: number; content: string }>(
  'posts/updatePost',
  async ({ id, content }) => {
    const response = await axios.patch<Post>(`${API_BASE_URL}/posts/${id}/`, { content });
    return response.data;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    toggleLike: (state, action) => {
      const post = state.items.find((p) => p.id === action.payload);
      if (post) {
        post.liked = !post.liked;
        post.like_count += post.liked ? 1 : -1;
      }
    },
    deletePost: (state, action) => {
      state.items = state.items.filter((post) => post.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
      });
  },
});

export const { toggleLike, deletePost } = postsSlice.actions;
export default postsSlice.reducer;