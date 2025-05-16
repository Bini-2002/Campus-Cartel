import React from 'react';
import { motion } from 'framer-motion';
import '../styles/components/dashboard/groups/GroupDetailsModal.css'; // Import the CSS

const ProfileSection = () => {
  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="text-gray-600">Display user profile information here.</p>
      <div className="mt-4 space-y-4">
        <motion.div
          className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-lg font-semibold">Name: John Doe</h2>
          <p className="text-sm text-gray-500">Email: john.doe@example.com</p>
        </motion.div>
        <motion.div
          className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-lg font-semibold">Bio</h2>
          <p className="text-sm text-gray-500">A short bio about the user goes here.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileSection;