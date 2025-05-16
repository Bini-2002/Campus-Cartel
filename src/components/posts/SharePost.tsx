import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import '../styles/SharePost.css'; // Adjust the path as needed

interface SharePostProps {
  isOpen: boolean;
  onClose: () => void;
  postUrl: string;
  postTitle: string;
}

const SharePost: React.FC<SharePostProps> = ({ isOpen, onClose, postUrl, postTitle }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleShare = (platform: string) => {
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black/30" />

        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-xl font-semibold text-gray-900">Share Post</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <input type="text" value={postUrl} readOnly className="flex-1 input-field" />
              <button
                onClick={handleCopyLink}
                className={`btn-secondary flex items-center gap-2 ${copied ? 'bg-green-100 text-green-600' : ''}`}
              >
                <LinkIcon className="h-5 w-5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-gray-50"
              >
                <img
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/twitter.svg"
                  alt="Twitter"
                  className="h-8 w-8"
                />
                <span className="text-sm font-medium">Twitter</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-gray-50"
              >
                <img
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/facebook.svg"
                  alt="Facebook"
                  className="h-8 w-8"
                />
                <span className="text-sm font-medium">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-gray-50"
              >
                <img
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/linkedin.svg"
                  alt="LinkedIn"
                  className="h-8 w-8"
                />
                <span className="text-sm font-medium">LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SharePost;