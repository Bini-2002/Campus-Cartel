import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import CreatePostPage from './pages/CreatePostPage'; // <-- Import the new page
import './styles/theme.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedTypes={['student', 'organization', 'admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Home (protected) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedTypes={['student', 'organization', 'admin']}>
                    <Home />
                  </ProtectedRoute>
                }
              />

              {/* Profile (protected, always current user) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedTypes={['student', 'organization', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Groups (protected) */}
              <Route
                path="/groups"
                element={
                  <ProtectedRoute allowedTypes={['student', 'organization', 'admin']}>
                    <Groups />
                  </ProtectedRoute>
                }
              />

              {/* Posts (protected) */}
              <Route
                path="/posts"
                element={
                  <ProtectedRoute allowedTypes={['student', 'organization', 'admin']}>
                    <Posts />
                  </ProtectedRoute>
                }
              />

              {/* Create Post (protected) */}
              <Route
                path="/create-post"
                element={
                  <ProtectedRoute allowedTypes={['student']}>
                    <CreatePostPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Panel (protected, admin only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedTypes={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              {/* 404 fallback */}
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;