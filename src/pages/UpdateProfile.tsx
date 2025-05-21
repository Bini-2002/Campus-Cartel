import React, { useState, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfigure';
import { useAuth } from '../context/AuthContext';
import '../styles/UpdateProfile.css';

const UpdateProfile = ({ profile, onClose }: { profile: any; onClose: () => void }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    firstname: profile.firstname || '',
    lastname: profile.lastname || '',
    bio: profile.bio || '',
    university: profile.university || '',
    major: profile.major || '',
    year: profile.year || '',
    email: profile.email || '',
    username: profile.username || '',
    user_type: profile.user_type || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    if (!form.username.trim() || !form.email.trim()) {
      setError('Username and Email are required.');
      setSaving(false);
      return;
    }
    try {
      let data: FormData | typeof form;
      let headers: any = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      if (avatarFile) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append('avatar', avatarFile);
        data = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        data = form;
        headers['Content-Type'] = 'application/json';
      }
      await axios.patch(
        `${API_BASE_URL}/users/${profile.id}/`,
        data,
        { headers }
      );
      setSaving(false);
      onClose();
    } catch (err: any) {
      setSaving(false);
      setError(
        err.response?.data?.detail ||
        (typeof err.response?.data === 'object'
          ? Object.values(err.response.data).flat().join(' ')
          : 'Failed to update profile. Please check your input.')
      );
    }
  };

  return (
    <div className="update-profile-modal">
      <div className="update-profile-content">
        <h2>Update Profile</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="update-profile-form" encType="multipart/form-data">
          <input name="firstname" value={form.firstname} onChange={handleChange} placeholder="First Name" />
          <input name="lastname" value={form.lastname} onChange={handleChange} placeholder="Last Name" />
          <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" />
          <input name="university" value={form.university} onChange={handleChange} placeholder="University" />
          <input name="major" value={form.major} onChange={handleChange} placeholder="Major" />
          <input name="year" value={form.year} onChange={handleChange} placeholder="Year" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            style={{ marginTop: '1rem' }}
          />
          <div className="update-profile-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;