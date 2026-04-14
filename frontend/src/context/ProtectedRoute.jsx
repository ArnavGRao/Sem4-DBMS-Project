import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

/**
 * ProtectedRoute - Protects user-level routes
 * Redirects to /login if user is not authenticated
 * Redirects to /admin if user is admin trying to access user routes
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, userRole } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

/**
 * AdminRoute - Protects admin-level routes
 * Redirects to /login if user is not authenticated
 * Redirects to /dashboard if user is a regular user trying to access admin routes
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, userRole } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * AuthRoute - For public auth pages (login/register)
 * Redirects to /dashboard if already authenticated as user
 * Redirects to /admin if already authenticated as admin
 */
export const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading, userRole } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};
