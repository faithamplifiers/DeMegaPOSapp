import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * AdminGuard component
 * Protects routes that should only be accessible by admin users
 */
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  
  // If we finished loading but there evaluates to be no valid user session, bounce them instantly.
  // This explicitly prevents signed-out users from being trapped on the line below evaluating `!profile`.
  if (!user) {
    return <Navigate to="/fa-admin/login" state={{ from: location }} replace />;
  }

  // If we have a user session, but the remote hydration request for the profile row is lagging behind
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }



  // Redirect to home if not an admin
  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;