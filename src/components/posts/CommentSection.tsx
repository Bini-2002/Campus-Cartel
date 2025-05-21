import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../apiConfigure';

interface Comment {
  id: number;
  author: { username: string };
  content: string;
  created_at: string;
  like_count: number;
  liked: boolean;
}

interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/posts/comments/?post=${postId}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ post: postId, content: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment('');
      } else {
        const errorData = await res.json();
        alert(
          typeof errorData === 'string'
            ? errorData
            : JSON.stringify(errorData)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number, liked: boolean) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts/comments/${id}/${liked ? 'unlike' : 'like'}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === id
              ? {
                  ...comment,
                  liked: !liked,
                  like_count: comment.like_count + (liked ? -1 : 1),
                }
              : comment
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-section-container">
      <div className="comment-section-header">Comments</div>
      <div className="comment-section-form">
        <input
          className="comment-input"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          disabled={loading}
        />
        <button className="btn-primary" onClick={handleAddComment} disabled={loading || !newComment.trim()}>
          Post
        </button>
      </div>
      <div className="comment-section-list">
        {comments.map(comment => (
          <div className="comment-card" key={comment.id}>
            <div className="comment-author">{comment.author.username}</div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-footer">
              <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
              <button
                className={`comment-like-btn${comment.liked ? ' liked' : ''}`}
                onClick={() => handleLike(comment.id, comment.liked)}
                disabled={loading}
              >
                {comment.liked ? 'Unlike' : 'Like'} ({comment.like_count})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;