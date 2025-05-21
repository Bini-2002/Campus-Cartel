import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Sidebar.css';

interface SidebarProps {
  setActiveSection: (section: string) => void;
  activeSection: string;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveSection, activeSection }) => {
  const { user } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <h2>Campus Cartel</h2>
      </div>
      <nav className="dashboard-sidebar-nav">
        <motion.button
          onClick={() => setActiveSection('home')}
          className={`sidebar-btn${activeSection === 'home' ? ' active' : ''}`}
          whileHover={{ scale: 1.05 }}
        >
          Home
        </motion.button>
        <motion.button
          onClick={() => setActiveSection('groups')}
          className={`sidebar-btn${activeSection === 'groups' ? ' active' : ''}`}
          whileHover={{ scale: 1.05 }}
        >
          Groups
        </motion.button>
        <Link
          to={`/profile/${user?.id}`}
          className={`sidebar-btn${activeSection === 'profile' ? ' active' : ''}`}
        >
          Profile
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;