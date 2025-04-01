import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Ripple } from '../components/magicui/ripple';

const AuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your request...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse the URL to determine the action type
        const url = new URL(window.location.href);
        const hash = url.hash;
        const query = url.search;
        
        console.log('Auth callback processing');
        console.log('Hash:', hash);
        console.log('Query:', query);
        
        // Determine the type of auth action
        let actionType = '';
        
        if (hash.includes('type=signup') || hash.includes('type=email_confirmation')) {
          actionType = 'email_confirmation';
        } else if (hash.includes('type=recovery') || query.includes('type=recovery')) {
          actionType = 'password_recovery';
        } else if (hash.includes('type=invite') || query.includes('type=invite')) {
          actionType = 'invite';
        } else if (hash.includes('access_token=') || query.includes('access_token=')) {
          actionType = 'login';
        }
        
        console.log('Detected action type:', actionType);
        
        // Wait a moment for Supabase to process the authentication
        // Supabase's Auth library automatically handles the token in the URL
        setTimeout(async () => {
          // Check if auth was successful by getting the current user
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('Auth callback error:', error);
            setStatus('error');
            setMessage(error.message || 'Authentication failed');
            return;
          }
          
          if (user) {
            // Successfully authenticated
            console.log('Authentication successful:', user);
            setStatus('success');
            
            // Set different success messages and redirects based on action type
            switch (actionType) {
              case 'email_confirmation':
                setMessage('Your email has been successfully verified! You can now sign in.');
                // Log the verification event
                try {
                  await supabase
                    .from('security_events')
                    .insert({
                      event_type: 'email_verification',
                      user_id: user.id,
                      details: {
                        verified: true,
                        user_agent: navigator.userAgent
                      }
                    });
                    
                  // For email verification, sign out the user to ensure they log in with credentials
                  await supabase.auth.signOut();
                } catch (logError) {
                  console.error('Error logging verification event:', logError);
                }
                
                // Redirect to signin page after a delay for email verification
                setTimeout(() => {
                  navigate('/signin');
                }, 2000);
                break;
                
              case 'password_recovery':
                setMessage('Your password has been successfully reset!');
                // For password reset, also redirect to signin
                setTimeout(() => {
                  navigate('/signin');
                }, 2000);
                break;
                
              case 'invite':
                setMessage('You have successfully accepted the invitation!');
                // For invites, we can also redirect to signin
                setTimeout(() => {
                  navigate('/signin');
                }, 2000);
                break;
                
              default:
                setMessage('Authentication successful!');
                // For general auth success (like magic link), go to dashboard
                setTimeout(() => {
                  navigate('/dashboard');
                }, 2000);
            }
          } else {
            // No user found, but no error either - might be an edge case
            console.warn('No user found after authentication callback');
            setStatus('error');
            setMessage('Could not complete authentication. Please try signing in manually.');
          }
        }, 1000);
      } catch (err) {
        console.error('Error in auth callback:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1121]">
      <div className="relative w-full max-w-md overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0b1121] via-[#142241] to-[#0b1121]"></div>
          <div className="absolute blur-3xl opacity-20 top-20 left-20 w-80 h-80 bg-[#3461FF] rounded-full animate-blob"></div>
          
          {/* Ripple background effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Ripple 
              mainCircleSize={300}
              mainCircleOpacity={0.07}
              numCircles={8}
              className="z-[1] [&>div]:!bg-[#3461FF]/10 [&>div]:!border-[#3461FF]/20"
            />
          </div>
        </div>
        
        {/* Card content */}
        <div className="relative z-10 bg-[#0b1121]/40 backdrop-blur-xl p-8 rounded-lg shadow-xl border border-[#3461FF]/20 text-center">
          <img 
            src="/white_logo.png" 
            alt="NeuraVerse Logo" 
            className="h-12 mx-auto mb-6" 
            onError={(e) => {
              console.error('Failed to load logo');
              e.currentTarget.style.display = 'none';
            }}
          />
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {status === 'loading' ? 'Processing' : 
             status === 'success' ? 'Success!' : 'Error'}
          </h1>
          
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 border-4 border-t-transparent border-[#3461FF] rounded-full animate-spin"></div>
              <p className="text-gray-300">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#3461FF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#3461FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-gray-300 mb-6">{message}</p>
              <p className="text-gray-400 text-sm">
                {message.includes('verified') 
                  ? 'Redirecting you to the login page...' 
                  : 'Redirecting you to the appropriate page...'}
              </p>
              
              {/* Quick sign in button */}
              {message.includes('verified') && (
                <button
                  onClick={() => navigate('/signin')}
                  className="mt-4 px-4 py-2 bg-[#3461FF] hover:bg-[#2D3FFF] text-white rounded-md transition-colors"
                >
                  Sign In Now
                </button>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="text-gray-300 mb-6">{message}</p>
              <button 
                onClick={() => navigate('/signin')}
                className="px-4 py-2 bg-[#3461FF] hover:bg-[#2D3FFF] text-white rounded-md transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;