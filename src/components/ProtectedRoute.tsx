// components/ProtectedRoute.tsx - Improved with session management
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSessionManager } from '../hooks/useSessionManager';
import { SessionWarning } from './SessionWarning';
import { AlertTriangle, Shield, Home, Clock, RefreshCw, User } from 'lucide-react';
import { getAuth } from "firebase/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowGuest?: boolean;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  allowGuest = false,
  requireEmailVerification = false,
}) => {
  const { 
    isAuthenticated, 
    isAdmin, 
    loading, 
    user, 
    isGuest,
    error 
  } = useAuth();
  
  const location = useLocation();
  
  // Session management
  const {
    sessionWarningData,
    getSessionInfo,
    isPersistent
  } = useSessionManager({
    autoLogoutMinutes: 30,
    sessionWarningMinutes: 5
  });

  const sessionInfo = getSessionInfo();

  // Debug logs (remove in production)
  console.log('=== PROTECTED ROUTE CHECK ===');
  console.log('Path:', location.pathname);
  console.log('Admin required:', adminOnly);
  console.log('Allow guest:', allowGuest);
  console.log('Require email verification:', requireEmailVerification);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Is admin:', isAdmin);
  console.log('Is guest:', isGuest);
  console.log('Loading:', loading);
  console.log('Session persistent:', isPersistent);
  console.log('Session info:', sessionInfo);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800/50"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Access</h2>
          <p className="text-gray-400">Checking your authentication status...</p>
          
          {/* Session info during loading */}
          {sessionInfo && (
            <div className="mt-4 text-xs text-gray-500">
              Session: {isPersistent ? 'Persistent' : 'Temporary'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authentication error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center p-8 bg-gray-900 rounded-lg border border-red-600/30">
          <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-6 border border-red-600/40">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-gray-400 mb-6">
            {error}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/signin'}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500 transition-colors"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-2 bg-gray-600 rounded-md text-white hover:bg-gray-500 transition-colors"
            >
              <Home className="h-4 w-4 inline mr-1" />
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    const redirectPath = `/signin?redirectTo=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectPath} replace />;
  }

  // Email verification required but not verified
  if (requireEmailVerification && user && !user.emailVerified) {
    // Import getAuth from Firebase

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center p-8 bg-gray-900 rounded-lg border border-yellow-600/30">
          <div className="mx-auto w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mb-6 border border-yellow-600/40">
            <User className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Email Verification Required</h2>
          <p className="text-gray-400 mb-6">
            Please verify your email address to access this feature. Check your inbox for a verification link.
          </p>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                if (user?.email) {
                  const auth = getAuth();
                  if (auth.currentUser) {
                    await auth.currentUser.sendEmailVerification();
                    // Optionally show a message to the user
                  }
                }
              }}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500 transition-colors"
            >
              Resend Email
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 px-4 py-2 bg-gray-600 rounded-md text-white hover:bg-gray-500 transition-colors"
            >
              <Home className="h-4 w-4 inline mr-1" />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guest access not allowed for this route
  if (isGuest && !allowGuest) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center p-8 bg-gray-900 rounded-lg border border-orange-600/30">
          <div className="mx-auto w-16 h-16 bg-orange-900/30 rounded-full flex items-center justify-center mb-6 border border-orange-600/40">
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Guest Access Limited</h2>
          <p className="text-gray-400 mb-6">
            This feature requires a full account. Please sign in with your credentials to continue.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/signin'}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 px-4 py-2 bg-gray-600 rounded-md text-white hover:bg-gray-500 transition-colors"
            >
              <Home className="h-4 w-4 inline mr-1" />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin-only route, but user is not admin
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center p-8 bg-gray-900 rounded-lg border border-red-600/30">
          <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-6 border border-red-600/40">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Administrator Access Required</h2>
          <p className="text-gray-400 mb-6">
            This area requires administrator privileges. Contact your system administrator if you need access.
          </p>
          
          {/* User info */}
          <div className="mb-6 p-3 bg-gray-800 rounded border border-gray-700">
            <p className="text-sm text-gray-300">
              Signed in as: <span className="text-white">{user?.email}</span>
            </p>
            <p className="text-xs text-gray-400">
              Role: {isGuest ? 'Guest' : 'User'}
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500 transition-colors"
          >
            <Home className="h-4 w-4 inline mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Session expired warning
  if (!sessionInfo?.isActive) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center p-8 bg-gray-900 rounded-lg border border-yellow-600/30">
          <div className="mx-auto w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mb-6 border border-yellow-600/40">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Session Expired</h2>
          <p className="text-gray-400 mb-6">
            Your session has expired due to inactivity. Please sign in again to continue.
          </p>
          <button
            onClick={() => window.location.href = '/signin'}
            className="px-6 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  // All checks passed - render the protected content with session warning overlay
  return (
    <>
      {children}
      
      {/* Session warning overlay */}
      <SessionWarning {...sessionWarningData} />
      
      {/* Session info indicator removed for cleaner UI */}
    </>
  );
};

export default ProtectedRoute;