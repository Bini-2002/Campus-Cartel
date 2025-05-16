import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import Home from './Home';
import Groups from './Groups';
import Profile from './Profile';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home />;
      case 'groups':
        return <Groups />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
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
      </div>
    </div>
  );
};

export default Dashboard;