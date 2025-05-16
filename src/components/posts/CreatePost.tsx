import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import '../styles/CreatePost.css'; // Adjust the path as needed

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, image?: File) => Promise<void>;
}

const CreatePost: React.FC<CreatePostProps> = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, image || undefined);
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setImage(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black/30" />

        <motion.div
          className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Create Post
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />

            {imagePreview && (
              <div className="relative mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-96 w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <motion.button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                whileHover={{ scale: 1.1 }}
              >
                <PhotoIcon className="h-6 w-6" />
                <span>Add Photo</span>
              </motion.button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <motion.button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !image)}
                className="btn-primary"
                whileHover={{ scale: 1.1 }}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </Dialog>
  );
};

export default CreatePost;