import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedTypes }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow admin to bypass restrictions
  if (!user || (!allowedTypes.includes(user.user_type) && !user.is_superuser)) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;