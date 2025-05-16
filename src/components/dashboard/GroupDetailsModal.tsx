import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/GroupDetailsModal.css'; // Import the CSS

interface GroupDetailsProps {
  group: {
    name: string;
    subject: string;
    description: string;
    max_members: number;
  };
  onClose: () => void;
}

const GroupDetailsModal: React.FC<GroupDetailsProps> = ({ group, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
        <h2 className="text-2xl font-bold mb-4">{group.name}</h2>
        <p className="text-gray-700 mb-2">Subject: {group.subject}</p>
        <p className="text-gray-700 mb-2">Description: {group.description}</p>
        <p className="text-gray-700 mb-2">Max Members: {group.max_members}</p>
        <button onClick={onClose} className="btn-secondary mt-4">
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default GroupDetailsModal;