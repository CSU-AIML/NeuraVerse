// components/auth/GoogleAuthButton.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { signInWithGoogle } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

// Type definition for Firebase auth error
interface FirebaseError {
  code?: string;
  message?: string;
  [key: string]: any; // Allow for other properties
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign in error:', error);
        
        // Safely handle the error message
        const errorMessage = (error as FirebaseError).message || 'Failed to sign in with Google';
        if (onError) onError(errorMessage);
        return;
      }
      
      if (!user) {
        if (onError) onError('No user returned from Google authentication');
        return;
      }
      
      // Refresh user data in auth context
      await refreshUser();
      
      // Navigate to dashboard
      navigate('/dashboard');
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error during Google sign in:', error);
      
      // Safely handle unexpected errors
      const errorMessage = error?.message || 'An unexpected error occurred';
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-2 px-4 mb-4"
    >
      <div className="flex items-center justify-center gap-2">
        <GoogleIcon className="w-5 h-5" />
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </div>
    </Button>
  );
};

// Google icon component
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default GoogleAuthButton;