import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { deletePost, updatePost, toggleLike } from '../../features/posts/postsSlice';
import '../../styles/Posts.css';

interface PostCardProps {
  post: any;
  onDelete: () => void;
  onLike: () => void;
  onUnlike: () => void;
  onComment: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onLike, onUnlike, onComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const dispatch = useDispatch<AppDispatch>();

  // Only allow editing if the current user is the author
  const currentUserId = Number(localStorage.getItem('user_id')); // Adjust this to your auth logic

  const handleUpdate = () => {
    dispatch(updatePost({ id: post.id, content: editContent }));
    setIsEditing(false);
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        <span className="post-author">{post.author_name}</span>
        <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
      </div>
      {isEditing ? (
        <div>
          <textarea
            className="post-edit-textarea"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
          <button className="btn-primary" onClick={handleUpdate}>Save</button>
          <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="post-content">{post.content}</div>
      )}
      {post.image && (
        <img src={post.image} alt="Post" className="post-image" />
      )}
      <div className="post-card-actions">
        <button
          className={`post-like-btn${post.liked ? ' liked' : ''}`}
          onClick={post.liked ? onUnlike : onLike}
        >
          {post.liked ? 'Unlike' : 'Like'} ({post.like_count})
        </button>
        <button className="post-comment-btn" onClick={onComment}>
          Comment ({post.comment_count})
        </button>
        {/* Only show edit/delete for the post author */}
        {post.author === currentUserId && (
          <>
            <button className="post-edit-btn" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button className="post-delete-btn" onClick={onDelete}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PostCard;