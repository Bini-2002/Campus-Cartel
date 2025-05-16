import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchUsers, deleteUser } from '../features/admin/adminSlice'; // Adjust path
import { motion } from 'framer-motion';
import '../styles/AdminPanel.css'; // Import the CSS

const AdminPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading, error } = useSelector((state: RootState) => state.admin); // Assuming 'admin' slice

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="admin-panel-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel-container">
        <p className="error-message">Error loading users: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="admin-panel-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="admin-panel-title">Admin Panel - User Management</h1>
      {users.length === 0 && !isLoading && (
        <p style={{textAlign: 'center', color: 'var(--text-color-light)'}}>No users found.</p>
      )}
      {users.length > 0 && (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Username</th>
                <th>User Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{user.user_type}</td>
                  <td>
                    <button 
                      className="btn-danger" // Using global style
                      onClick={() => dispatch(deleteUser(user.id))}
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;