import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfigure';

interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  user_type: string;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // 1. Get JWT token
      const response = await axios.post<{ access: string; refresh: string }>(`${API_BASE_URL}/token/`, {
        email,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setToken(access);

      // 2. Get user info (by email)
      const userRes = await axios.get<User[]>(`${API_BASE_URL}/users/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const user = userRes.data.find((u) => u.email === email);
      if (user) {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        throw new Error('User not found.');
      }
    } catch (error) {
      throw new Error('Invalid email or password.');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await axios.post(`${API_BASE_URL}/users/register/`, {
        username,
        email,
        password,
      });
    } catch (error) {
      throw new Error('Registration failed.');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};