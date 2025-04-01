import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Ripple } from '../components/magicui/ripple';

const EmailVerification = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the URL parameters
        const hash = window.location.hash;
        const params = new URLSearchParams(window.location.search);
        
        // Check if there's a type=signup_confirmation or type=email_confirmation in the hash
        const isEmailConfirmation = hash.includes('type=signup_confirmation') || 
                                  hash.includes('type=email_confirmation') ||
                                  params.get('type') === 'signup_confirmation' ||
                                  params.get('type') === 'email_confirmation';
        
        if (isEmailConfirmation) {
          setVerifying(true);
          
          // For Supabase, typically the auth callback is handled automatically
          // We'll just wait a moment to let the default handler work
          setTimeout(async () => {
            // Check if the user is now authenticated
            const { data } = await supabase.auth.getUser();
            
            if (data.user) {
              // User is authenticated, which means verification worked
              setSuccess(true);
              
              // Log the verification event
              try {
                await supabase
                  .from('security_events')
                  .insert({
                    event_type: 'email_verification',
                    user_id: data.user.id,
                    details: {
                      verified: true,
                      user_agent: navigator.userAgent
                    }
                  });
              } catch (logError) {
                console.error('Error logging verification event:', logError);
              }
            } else {
              // If we can't find a user, something went wrong
              setError('Email verification failed. Please try again or contact support.');
            }
            
            setVerifying(false);
          }, 1500);
        } else {
          // Not an email verification link
          navigate('/signin');
        }
      } catch (err: any) {
        console.error('Error during email verification:', err);
        setError(err.message || 'An error occurred during email verification');
        setVerifying(false);
      }
    };

    handleEmailVerification();
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
            {verifying ? 'Verifying Your Email' : 
              success ? 'Email Verified!' : 'Verification Failed'}
          </h1>
          
          {verifying && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 border-4 border-t-transparent border-[#3461FF] rounded-full animate-spin"></div>
              <p className="text-gray-300">Please wait while we verify your email...</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-md text-red-200">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#3461FF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#3461FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-gray-300 mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
            </div>
          )}
          
          {!verifying && (
            <Button
              onClick={() => navigate('/signin')}
              className="bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-6"
            >
              Go to Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;