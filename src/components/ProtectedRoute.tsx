// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className='loading loading-ring loading-xl text-accent text-bold'/>
        <div>Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin/superuser role if required
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
        <h2 className="text-error text-2xl font-bold">Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <a className="btn btn-ghost mt-2" href="/">Go to Home</a>
      </div>
    );
  }

  return <>{children}</>;
};