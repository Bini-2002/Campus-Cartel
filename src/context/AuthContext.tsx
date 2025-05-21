import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfigure';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  user_type: string;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
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

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post<TokenResponse>(`${API_BASE_URL}/token/`, {
        username,
        password,
      });
      const { access, refresh } = response.data;

      const userResponse = await axios.get<User[]>(`${API_BASE_URL}/users/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      const loggedInUser = userResponse.data.find((u) => u.username === username);

      if (loggedInUser) {
        setUser(loggedInUser);
        setToken(access);
      } else {
        throw new Error('User not found');
      }
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await axios.post(`${API_BASE_URL}/register/`, {
        username,
        email,
        password,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
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