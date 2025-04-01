import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  adminOnly = false, 
  children 
}) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're on a page with a password reset token
  const isPasswordResetAttempt = 
    location.hash && 
    location.hash.includes('access_token=') && 
    location.hash.includes('type=recovery');
  
  // Allow access to page with reset token even if not authenticated
  if (isPasswordResetAttempt) {
    console.log("Password reset token detected, allowing access");
    return <>{children}</>;
  }
  
  // Show loading state while authentication is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-blue-600 border-gray-700 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300">Verifying credentials...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to the signin page
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // For admin-only routes, check if the user has admin privileges
  if (adminOnly && !isAdmin) {
    // Show access denied screen
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="p-8 bg-gray-900 rounded-lg border border-red-600/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-red-900/30 border border-red-700/30">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
            </div>
            
            <p className="mb-4 text-gray-300">
              You don't have the necessary permissions to access this page.
            </p>
            <p className="mb-6 text-gray-400">
              Only administrators can access this area. You'll be redirected to the dashboard.
            </p>
            
            <div className="mt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If all checks pass, render the child components
  return <>{children}</>;
};

export default ProtectedRoute;