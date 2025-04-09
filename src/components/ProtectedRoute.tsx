// components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { authenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  // Prevent access to admin-only routes for non-admin users
  useEffect(() => {
    if (!isLoading && adminOnly && !isAdmin) {
      navigate('/dashboard');
    }
  }, [adminOnly, isAdmin, isLoading, navigate]);

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800/50"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-l-transparent border-r-transparent border-b-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Access</h2>
          <p className="text-gray-400">Please wait while we check your permissions...</p>
        </div>
      </div>
    );
  }

  // For admin-only routes, redirect to dashboard if not admin
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center p-8 bg-gray-900 rounded-lg border border-red-600/30">
          <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-6 border border-red-600/40">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            This area requires administrator privileges. Please contact an admin if you need access.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // For general protected routes that require authentication
  if (!authenticated && adminOnly) {
    return <Navigate to="/signin" />;
  }

  // Allow guest access to non-admin protected routes
  return <>{children}</>;
};

export default ProtectedRoute;