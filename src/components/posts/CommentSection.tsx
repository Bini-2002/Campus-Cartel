import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfigure';
import { motion } from 'framer-motion';
import '../styles/CommentSection'; // Import your CSS file

interface Comment {
  id: number;
  content: string;
  author_name: string;
  likes: number;
}

const CommentsSection: React.FC<{ postId: number }> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      const response = await axios.get<Comment[]>(`${API_BASE_URL}/posts/comments/?post=${postId}`);
      setComments(response.data);
    };
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    try {
      const response = await axios.post<Comment>(
        `${API_BASE_URL}/posts/comments/`,
        { post: postId, content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-gray-800">{comment.content}</p>
            <p className="text-sm text-gray-500">By {comment.author_name}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleAddComment} className="btn-primary">
          Add
        </button>
      </div>
    </motion.div>
  );
};

export default CommentsSection;