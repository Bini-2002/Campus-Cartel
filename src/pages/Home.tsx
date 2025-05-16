import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchPosts, toggleLike, deletePost } from '../features/posts/postsSlice';
import PostCard from '../components/posts/PostCard';
import { motion } from 'framer-motion';
import '../styles/Home.css';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: posts, isLoading, error } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="home-page-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page-container">
        <p className="error-message">Error loading posts: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="home-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="home-title">Campus Feed</h1>
      {posts.length === 0 && !isLoading && (
        <p className="no-posts-message">No posts yet. Be the first to share something!</p>
      )}
      <div className="posts-list">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            className="post-card-wrapper"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: post.id * 0.05 }}
          >
            <PostCard
              post={post}
              onLike={() => dispatch(toggleLike({ postId: post.id, like: true }))}
              onUnlike={() => dispatch(toggleLike({ postId: post.id, like: false }))}
              onComment={() => {/* Implement comment handler here */}}
              onDelete={() => dispatch(deletePost(post.id))}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Home;