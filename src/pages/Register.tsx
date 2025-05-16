import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfigure';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    user_type: 'student',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.user_type === 'student' && !formData.email.endsWith('.edu.et')) {
      setError("Students must register with a university email ending in '.edu.et'.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/users/register/`, formData);
      navigate('/login');
    } catch (error: any) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-container">
        <h2 className="auth-title">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstname}
            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="input-field"
            required
          />
          <select
            value={formData.user_type}
            onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
            className="input-field"
            required
          >
            <option value="student">Student</option>
            <option value="organization">Organization</option>
          </select>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Register
          </button>
        </form>
        <div className="auth-link-row">
          Already have an account?{' '}
          <a href="/login" className="auth-link">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;