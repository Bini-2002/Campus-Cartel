import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import groupsReducer from '../features/groups/groupsSlice';
import adminReducer from '../features/admin/adminSlice'; // <-- Ensure this import path is correct

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    groups: groupsReducer,
    admin: adminReducer, // <-- This adds the admin slice to your store
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;