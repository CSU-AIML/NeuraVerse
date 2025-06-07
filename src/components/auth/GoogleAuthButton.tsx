// components/auth/GoogleAuthButton.tsx - Updated for Firebase + Supabase Integration
import { useState } from 'react';
import { signInWithGoogleAndSync } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  onSuccess, 
  onError, 
  disabled = false,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithGoogleRedirect } = useAuth();

  const handleGoogleSignIn = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    
    try {
      // Try using the auth context methods first (recommended)
      if (signInWithGoogle) {
        await signInWithGoogle();
      } else {
        // Fallback to direct Firebase method
        const result = await signInWithGoogleAndSync();
        
        if (result.error) {
          throw result.error;
        }
      }

      // Call success callback if provided
      onSuccess?.();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Handle specific error cases
      if (error.code || error.message) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled. Please try again.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup was blocked. Trying redirect method...';
            // Try redirect as fallback
            try {
              if (signInWithGoogleRedirect) {
                await signInWithGoogleRedirect();
                return; // Redirect will handle the rest
              }
            } catch (redirectError) {
              errorMessage = 'Both popup and redirect methods failed. Please check your browser settings.';
            }
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please wait a moment and try again.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Google sign-in is not enabled. Please contact support.';
            break;
          default:
            if (error.message) {
              if (error.message.includes('popup-closed-by-user')) {
                errorMessage = 'Sign-in was cancelled. Please try again.';
              } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
              } else if (error.message.includes('blocked')) {
                errorMessage = 'Popup was blocked. Please allow popups for this site or try again.';
              } else {
                errorMessage = error.message;
              }
            }
        }
      }

      // Call error callback if provided
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultClassName = `
    w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 
    text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 
    disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 
    dark:disabled:text-slate-500 py-3.5 px-4 rounded-xl font-medium 
    transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 
    disabled:transform-none disabled:hover:shadow-sm focus:outline-none focus:ring-2 
    focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      type="button"
      className={className || defaultClassName}
      aria-label="Sign in with Google"
      title={isLoading ? "Signing in..." : "Sign in with Google"}
    >
      <span className="flex items-center justify-center">
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin mr-3"></div>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg 
              className="w-5 h-5 mr-3 flex-shrink-0" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </span>
    </button>
  );
};

export default GoogleAuthButton;