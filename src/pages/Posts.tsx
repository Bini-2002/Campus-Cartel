import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPosts, deletePost } from '../features/posts/postsSlice';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import CommentSection from '../components/posts/CommentSection';
import { useAuth } from '../context/AuthContext';
import '../styles/Posts.css';

const Posts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: posts, isLoading, error } = useSelector((state: RootState) => state.posts);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleCreatePost = async (content: string, image?: File) => {
    // Dispatch your create post action here
    setIsCreateOpen(false);
  };

  return (
    <div className="posts-page-container">
      <h1 className="posts-title">Posts</h1>
      {user?.user_type === 'student' && (
        <button className="btn-primary" style={{ marginBottom: '1.5rem' }} onClick={() => setIsCreateOpen(true)}>
          Create Post
        </button>
      )}
      <CreatePost
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePost}
      />
      {isLoading && <div>Loading posts...</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="posts-list">
        {posts.length === 0 && !isLoading && (
          <div className="no-posts-message">No posts yet. Be the first to share something!</div>
        )}
        {posts.map((post) => (
          <div key={post.id}>
            <PostCard
              post={post}
              onDelete={() => dispatch(deletePost(post.id))}
              onLike={() => {/* Like logic */}}
              onUnlike={() => {/* Unlike logic */}}
              onComment={() => {/* Comment logic */}}
            />
            <CommentSection postId={post.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;