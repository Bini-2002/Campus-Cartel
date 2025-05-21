import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../apiConfigure';
import '../styles/Profile.css';
import UpdateProfile from './UpdateProfile';
import PostCard from '../components/posts/PostCard';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  // Fetch profile function (so we can call it after update)
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${user.id}/`);
      setProfile(response.data);
    } catch (error) {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/posts/`);
        setPosts((res.data as any[]).filter((p: any) => p.author === profile.id));
      } catch (e) {
        setPosts([]);
      }
    };
    fetchPosts();
  }, [profile]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      await axios.delete(`${API_BASE_URL}/users/${profile.id}/`);
      logout();
      navigate('/login');
    }
  };

  const handleDeletePost = async (postId: number) => {
    await axios.delete(`${API_BASE_URL}/posts/${postId}/`);
    setPosts(posts.filter((p) => p.id !== postId));
  };

  // When update modal closes, refetch profile
  const handleUpdateClose = () => {
    setShowUpdate(false);
    fetchProfile();
  };

  if (!profile) {
    return <div className="profile-page-container" style={{textAlign: 'center', padding: '2rem'}}>No profile found.</div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-cover-photo-container">
        <div className="profile-avatar-container">
          <img
            src={profile.avatar || '/default-avatar.png'}
            alt="Profile"
            className="profile-avatar"
          />
        </div>
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
          <div className="profile-details">
            <div><b>Email:</b> {profile.email}</div>
            <div><b>University:</b> {profile.university}</div>
            <div><b>Major:</b> {profile.major}</div>
            <div><b>Year:</b> {profile.year}</div>
          </div>
        </div>
        <div className="profile-actions">
          <button className="profile-action-btn" onClick={() => setShowUpdate(true)}>Update Profile</button>
          <button className="profile-action-btn" onClick={handleDelete}>Delete Account</button>
          <button className="profile-action-btn" onClick={logout}>Logout</button>
        </div>
      </div>
      {showUpdate && (
        <UpdateProfile profile={profile} onClose={handleUpdateClose} />
      )}
      <div className="profile-posts-section">
        <h2>My Posts</h2>
        <div className="posts-list">
          {posts.length === 0 && <div className="no-posts-message">No posts yet.</div>}
            {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => {}} // Provide a no-op or actual handler as needed
              liked={false}    // Set to true/false or derive from post/user state
            />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;