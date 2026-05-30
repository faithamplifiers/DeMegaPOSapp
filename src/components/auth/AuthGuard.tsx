import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while explicitly checking initial authentication state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a role verification is explicitly needed AND user is authenticated, wait for profile mapping
  if (allowedRoles && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Gracefully bounce Admins out of the basic Creator Dashboard if they accidentally land here
  if (profile?.role === 'admin' && location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/fa-admin" replace />;
  }

  // Use the database profile role instead of metadata
  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;