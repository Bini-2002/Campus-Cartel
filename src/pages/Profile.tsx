import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../apiConfigure';
import '../styles/Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${id || user?.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        setProfile(response.data);
      } catch (error) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [id, user]);

  if (!profile) {
    return <div className="profile-page-container" style={{textAlign: 'center', padding: '2rem'}}>No profile found.</div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-cover-photo-container">
        <img
          src={profile.coverPhoto || 'https://via.placeholder.com/800x200'}
          alt="Cover"
          className="profile-cover-photo"
        />
      </div>
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img
            src={profile.avatar || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="profile-avatar"
          />
        </div>
        <div className="profile-info">
          <div className="profile-name">{profile.firstname} {profile.lastname}</div>
          <div className="profile-bio">{profile.bio}</div>
        </div>
      </div>
      {/* Add posts or other info here */}
    </div>
  );
};

export default Profile;