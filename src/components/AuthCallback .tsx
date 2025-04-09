// components/AuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { parseResetToken } from './auth/utils';
import { useAuth } from '../contexts/AuthContext';

/**
 * Universal auth callback handler component
 * This component handles redirects from Supabase auth flows (email confirmation, password reset, etc.)
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for password reset token
        const hasResetToken = parseResetToken();
        
        // If we have a reset token, redirect to the reset password page
        if (hasResetToken) {
          console.log('Reset token detected, redirecting to reset password page');
          navigate('/reset-password' + window.location.search + window.location.hash);
          return;
        }
        
        // Check for session from URL parameters (for email confirmation)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Authentication failed: ' + error.message);
          
          // Redirect to sign in after a delay
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
          return;
        }
        
        if (data?.session) {
          // Session exists, refresh user data
          await refreshUser();
          
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          // No session, redirect to sign in
          setStatus('error');
          setMessage('No authentication session found. Please sign in.');
          
          setTimeout(() => {
            navigate('/signin');
          }, 2000);
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try signing in again.');
        
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto bg-[#0b1121]/80 backdrop-blur-xl p-8 rounded-lg shadow-xl border border-[#3461FF]/20">
        <div className="text-center">
          <img 
            src="/white_logo.png" 
            alt="NeuraVerse" 
            className="h-12 w-auto mx-auto mb-6"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {status === 'processing' && (
            <div className="mb-4">
              <div className="h-10 w-10 border-4 border-t-[#3461FF] border-[#142241] rounded-full animate-spin mx-auto mb-4"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mb-4 text-green-400 text-5xl">✓</div>
          )}
          
          {status === 'error' && (
            <div className="mb-4 text-red-400 text-5xl">✗</div>
          )}
          
          <h2 className={`text-2xl font-bold mb-2 ${
            status === 'processing' ? 'text-white' :
            status === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {status === 'processing' ? 'Authentication in Progress' :
             status === 'success' ? 'Authentication Successful' : 'Authentication Failed'}
          </h2>
          
          <p className="text-gray-300">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;