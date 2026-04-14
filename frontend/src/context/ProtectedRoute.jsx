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
      <div className="app-shell grid min-h-screen place-items-center px-4">
        <div className="ui-panel page-enter w-full max-w-sm p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-700" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Preparing your workspace...</p>
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
      <div className="app-shell grid min-h-screen place-items-center px-4">
        <div className="ui-panel page-enter w-full max-w-sm p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-700" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Loading admin console...</p>
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
      <div className="app-shell grid min-h-screen place-items-center px-4">
        <div className="ui-panel page-enter w-full max-w-sm p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-700" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};
