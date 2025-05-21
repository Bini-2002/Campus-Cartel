import React from 'react';

interface PostCardProps {
  post: {
    id: number;
    author: { username: string };
    content: string;
    image?: string;
    created_at: string;
    like_count: number;
    comment_count: number;
    // ...other fields
  };
  onLike: (postId: number, liked: boolean) => void;
  liked: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, liked }) => {
  return (
    <div className="post-card">
      <div className="post-header">
        <span className="post-author">{post.author.username}</span>
        <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
      </div>
      <div className="post-content">{post.content}</div>
      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Post" />
        </div>
      )}
      <div className="post-actions">
        <button
          className={`post-like-btn${liked ? ' liked' : ''}`}
          onClick={() => onLike(post.id, liked)}
        >
          {liked ? 'Unlike' : 'Like'} ({post.like_count})
        </button>
        <span className="post-comment-count">
          💬 {post.comment_count}
        </span>
      </div>
    </div>
  );
};

export default PostCard;