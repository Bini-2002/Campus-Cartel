import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfigure';
import { motion } from 'framer-motion';
import GroupDetailsModal from './GroupDetailsModal';
import '../../styles/components/dashboard/groups/GroupSection.css'; // Import your CSS file

const GroupsSection = () => {
  const [groups, setGroups] = useState<{ id: number; name: string; subject: string; description: string; max_members: number }[]>([]);
  const [newGroup, setNewGroup] = useState({ name: '', subject: '', description: '', max_members: 10 });
  const [editingGroup, setEditingGroup] = useState<{ id: number; name: string; subject: string; description: string; max_members: number } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{ id: number; name: string; subject: string; description: string; max_members: number } | null>(null); // For viewing group details

  useEffect(() => {
    const fetchGroups = async () => {
      const response = await axios.get<{ id: number; name: string; subject: string; description: string; max_members: number }[]>(`${API_BASE_URL}/groups/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setGroups(response.data);
    };
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/groups/`, newGroup, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setGroups([...groups, response.data as { id: number; name: string; subject: string; description: string; max_members: number }]);
      setNewGroup({ name: '', subject: '', description: '', max_members: 10 });
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      if (!editingGroup) return;
      const response = await axios.put(`${API_BASE_URL}/groups/${editingGroup.id}/`, editingGroup, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (editingGroup) {
        setGroups(groups.map((group) => (group.id === editingGroup.id ? response.data as { id: number; name: string; subject: string; description: string; max_members: number } : group)));
      }
      setEditingGroup(null);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDeleteGroup = async (groupId : number) => {
    try {
      await axios.delete(`${API_BASE_URL}/groups/${groupId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold mb-4">Groups</h1>

      {/* Create Group Form */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create a New Group</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Group Name"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Subject"
            value={newGroup.subject}
            onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="Description"
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max Members"
            value={newGroup.max_members}
            onChange={(e) => setNewGroup({ ...newGroup, max_members: parseInt(e.target.value) })}
            className="input-field"
          />
          <button onClick={handleCreateGroup} className="btn-primary">
            Create Group
          </button>
        </div>
      </div>

      {/* List of Groups */}
      <div className="space-y-4">
        {groups.map((group) => (
          <motion.div
            key={group.id}
            className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-lg font-semibold">{group.name}</h2>
            <p>{group.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={() => setSelectedGroup(group)} // Open group details modal
                className="btn-primary"
              >
                View Details
              </button>
              <button
                onClick={() => setEditingGroup(group)}
                className="btn-secondary"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteGroup(group.id)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Group Form */}
      {editingGroup && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Edit Group</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Group Name"
              value={editingGroup.name}
              onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Subject"
              value={editingGroup.subject}
              onChange={(e) => setEditingGroup({ ...editingGroup, subject: e.target.value })}
              className="input-field"
            />
            <textarea
              placeholder="Description"
              value={editingGroup.description}
              onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max Members"
              value={editingGroup.max_members}
              onChange={(e) => setEditingGroup({ ...editingGroup, max_members: parseInt(e.target.value) })}
              className="input-field"
            />
            <button onClick={handleUpdateGroup} className="btn-primary">
              Update Group
            </button>
            <button onClick={() => setEditingGroup(null)} className="btn-secondary ml-4">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)} // Close modal
        />
      )}
    </motion.div>
  );
};

export default GroupsSection;