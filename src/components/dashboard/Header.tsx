import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/Header.css';

const Header = () => {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-content">
        <motion.h1
          className="dashboard-header-title"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Campus Cartel Dashboard
        </motion.h1>
        <div className="dashboard-header-actions">
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
          >
            Notifications
          </motion.button>
          <motion.button
            className="btn-danger"
            whileHover={{ scale: 1.05 }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;