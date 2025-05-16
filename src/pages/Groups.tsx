import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchGroups, deleteGroup } from '../features/groups/groupsSlice';
import { motion } from 'framer-motion';
import Chat from '../components/dashboard/groups/Chat';
import { useAuth } from '../context/AuthContext'; 
import '../styles/Groups.css'; // Import your CSS file

const Groups: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector((state: RootState) => state.groups.items);
  const isLoading = useSelector((state: RootState) => state.groups.isLoading);
  const error = useSelector((state: RootState) => state.groups.error);

  const { user } = useAuth(); // Make sure useAuth provides user.id and user.user_type
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isMemberOfSelected, setIsMemberOfSelected] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (selectedGroup && user) {
      // Ensure group.members is an array of user IDs
      setIsMemberOfSelected(selectedGroup.members?.includes(user.id));
    } else {
      setIsMemberOfSelected(false);
    }
  }, [selectedGroup, user]);

  const handleJoinGroup = async (group: any) => {
    if (!user || user.user_type !== 'student') {
        alert('Only students can join groups.');
        return;
    }
    setJoiningGroupId(group.id);
    try {
      // Replace with your actual API call structure if different
      await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/groups/${group.id}/join/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      // Optimistically update or refetch groups
      dispatch(fetchGroups()); // Refetch to get updated member list
      if (selectedGroup && selectedGroup.id === group.id) {
        setIsMemberOfSelected(true);
      }
    } catch (err) {
      alert('Failed to join group. Please try again.');
      console.error("Join group error:", err);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const openChatForGroup = (group: any) => {
    if (!user || user.user_type !== 'student') {
        alert('Only students can open chat.');
        return;
    }
    // Check if user is a member before opening chat
    if (group.members?.includes(user.id)) {
        setSelectedGroup(group);
    } else {
        alert('You must join the group to open chat.');
    }
  };


  if (isLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error-message">Error: {error}</p>
        <button
          onClick={() => dispatch(fetchGroups())}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="groups-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="groups-title">Study Groups</h1>
      {!selectedGroup ? (
        <div className="group-list">
          {groups.length === 0 && !isLoading && (
            <p style={{textAlign: 'center', color: 'var(--text-color-light)'}}>No groups available. Why not create one?</p>
          )}
          {groups.map((group) => (
            <motion.div
              key={group.id}
              className="group-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="group-card-content">
                <div className="group-info">
                  <h2>{group.name}</h2>
                  <p>{group.description}</p>
                </div>
                <div className="group-actions">
                  {user?.user_type === 'student' && (
                    <>
                      {!group.members?.includes(user.id) ? (
                        <motion.button
                          className="btn-join"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={joiningGroupId === Number(group.id)}
                          onClick={() => handleJoinGroup(group)}
                        >
                          {joiningGroupId === Number(group.id) ? 'Joining...' : 'Join Group'}
                        </motion.button>
                      ) : (
                        <motion.button
                          className="btn-chat"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openChatForGroup(group)}
                        >
                          Open Chat
                        </motion.button>
                      )}
                    </>
                  )}
                  {/* Add admin delete functionality if needed */}
                  {/* <motion.button
                    className="btn-delete"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(deleteGroup(group.id))}
                  >
                    Delete
                  </motion.button> */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="chat-view-container">
          <button
            className="back-to-groups-btn"
            onClick={() => setSelectedGroup(null)}
          >
            ← Back to Groups
          </button>
          <Chat
            groupId={selectedGroup.id}
            userType={user?.user_type || ''} // Pass userType
            isMember={isMemberOfSelected} // Pass membership status
          />
        </div>
      )}
    </motion.div>
  );
};

export default Groups;