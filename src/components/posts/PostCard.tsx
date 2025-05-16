import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, TrashIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import '../../styles/PostCard.css'; // Adjust the path as needed

interface PostCardProps {
  post: {
    id: number;
    content: string;
    like_count: number;
    comment_count: number;
    liked: boolean;
  };
  onLike: (postId: number) => void;
  onUnlike: (postId: number) => void;
  onComment: (postId: number) => void;
  onDelete: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onUnlike, onComment, onDelete }) => {
  return (
    <motion.div
      className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.02 }}
    >
      <p className="text-gray-800">{post.content}</p>
      <div className="flex items-center justify-between mt-4">
        <motion.button
          onClick={() => (post.liked ? onUnlike(post.id) : onLike(post.id))}
          className={`flex items-center gap-2 ${
            post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          <HeartIcon className="h-5 w-5" />
          <span>{post.like_count}</span>
        </motion.button>
        <motion.button
          onClick={() => onComment(post.id)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-500"
          whileHover={{ scale: 1.1 }}
        >
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span>{post.comment_count}</span>
        </motion.button>
        <motion.button
          onClick={() => onDelete(post.id)}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500"
          whileHover={{ scale: 1.1 }}
        >
          <TrashIcon className="h-5 w-5" />
          <span>Delete</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PostCard;