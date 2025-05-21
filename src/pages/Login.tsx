import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfigure';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

// Define the User type or import it from your types/models
type User = {
  id: string;
  email: string;
  username: string;
  avatar: string;
  user_type: string;
  is_superuser: boolean;
  // Add other user fields as needed
};

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/token/`, formData);
      const data = response.data as { access: string; refresh: string };
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Fetch all users and filter by email
      const userRes = await axios.get<User[]>(`${API_BASE_URL}/users/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      const user = userRes.data.find((u: User) => u.email === formData.email);
      if (user) {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        setError('User not found.');
      }
    } catch (error: any) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-container">
        <h2 className="auth-title">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
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
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-link-row">
          Don&apos;t have an account?{' '}
          <a href="/register" className="auth-link">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;