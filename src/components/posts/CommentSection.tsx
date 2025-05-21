import React, { useEffect, useState } from 'react';
import '../../styles/CommentSection.css';

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  liked: boolean;
  likes: number;
}

interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch comments
  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/comments/?post=${postId}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .finally(() => setLoading(false));
  }, [postId]);

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const res = await fetch('/api/posts/comments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post: postId, content: newComment }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments([comment, ...comments]);
      setNewComment('');
    }
    setLoading(false);
  };

  // Like/unlike comment
  const handleLike = async (commentId: number, liked: boolean) => {
    setLoading(true);
    await fetch(`/api/posts/comments/${commentId}/${liked ? 'unlike' : 'like'}/`, {
      method: liked ? 'DELETE' : 'POST',
    });
    setComments(comments =>
      comments.map(c =>
        c.id === commentId
          ? { ...c, liked: !liked, likes: liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
    setLoading(false);
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
            <div className="comment-author">{comment.author_name}</div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-footer">
              <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
              <button
                className={`comment-like-btn${comment.liked ? ' liked' : ''}`}
                onClick={() => handleLike(comment.id, comment.liked)}
                disabled={loading}
              >
                {comment.liked ? 'Unlike' : 'Like'} ({comment.likes})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;