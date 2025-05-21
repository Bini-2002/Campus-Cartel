import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import Posts from './Posts';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('posts');
  const navigate = useNavigate();

  const renderSection = () => {
    switch (activeSection) {
      case 'posts':
        return <Posts />;
      default:
        return <Posts />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar setActiveSection={setActiveSection} activeSection={activeSection} />
      <div className="dashboard-main-content">
        <Header />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            className="dashboard-section-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
        {/* Only this floating button remains */}
        <button
          className="btn-primary"
          style={{
            position: 'fixed',
            right: '2rem',
            bottom: '2rem',
            padding: '0.5rem 1.25rem',
            fontSize: '1rem',
            borderRadius: '999px',
            zIndex: 100
          }}
          onClick={() => navigate('/create-post')}
        >
          Create Post
        </button>
      </div>
    </div>
  );
};

export default Dashboard;