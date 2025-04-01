import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { TypingAnimation } from '../components/magicui/typing-animation';
import { Button } from '../components/ui/button';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Parse the reset token from URL on component mount
  useEffect(() => {
    console.log("Full URL:", window.location.href);
    console.log("URL hash:", location.hash);
    console.log("URL search params:", location.search);
    
    // Try to parse the token from different possible locations
    let token = null;
    
    // Check the hash fragment first (e.g. #access_token=xxx)
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.replace('#', ''));
      token = hashParams.get('access_token');
      console.log("Token from hash:", token);
    }
    
    // If not in hash, check query string (e.g. ?access_token=xxx)
    if (!token && location.search) {
      const queryParams = new URLSearchParams(location.search);
      token = queryParams.get('access_token');
      console.log("Token from query:", token);
    }
    
    // Last resort - try to find token in the full URL
    if (!token) {
      const fullUrl = window.location.href;
      const tokenMatch = fullUrl.match(/access_token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        token = tokenMatch[1];
        console.log("Token from URL regex:", token);
      }
    }
    
    if (token) {
      setResetToken(token);
      console.log("Reset token found and set");
    } else {
      setError('Invalid or missing password reset token. Please request a new password reset link.');
      console.error("No token found in URL");
    }
  }, [location]);

  // Validate password strength
  useEffect(() => {
    if (password.length < 8) {
      setPasswordStrength('weak');
    } else if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  }, [password]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (passwordStrength === 'weak') {
      setError('Please choose a stronger password');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Verify we have a token
      if (!resetToken) {
        throw new Error('Missing reset token. Please request a new password reset link.');
      }
      
      console.log("Attempting to update password with token");
      
      // Update the user's password using the token
      const { error } = await supabase.auth.updateUser({ 
        password 
      });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Password updated successfully");
      
      // Log successful password reset in the security_events table
      try {
        // Get IP address for security logging (simple approach for demo)
        let ipAddress = 'unknown';
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        } catch (ipErr) {
          console.warn('Could not get IP address:', ipErr);
        }

        // Log the security event
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          await supabase
            .from('security_events')
            .insert({
              event_type: 'password_reset',
              user_id: user.user.id,
              details: {
                reset_completed: true,
                user_agent: navigator.userAgent,
                ip_address: ipAddress
              }
            });
        }
      } catch (securityLogError) {
        // Continue even if logging fails
        console.error('Error logging security event:', securityLogError);
      }
      
      // Remove hash from URL to prevent token reuse
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setSuccessMessage('Your password has been successfully reset');
      
      // Navigate back to the sign-in page after a delay
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
      <TypingAnimation 
        className="text-2xl font-bold mb-6 text-center text-white"
        duration={40}
        as="h2"
      >
        Reset Your Password
      </TypingAnimation>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-md text-green-200">
          {successMessage}
        </div>
      )}
      
      {!successMessage && (
        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label className="block text-gray-200 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-gray-800 border border-gray-700 pl-10 pr-10 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter your new password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-gray-700 overflow-hidden">
                  <div 
                    className={`h-full ${
                      passwordStrength === 'weak' ? 'bg-red-500 w-1/3' : 
                      passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {passwordStrength === 'weak' ? 'Weak' : 
                   passwordStrength === 'medium' ? 'Medium' : 'Strong'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Use at least 8 characters with uppercase letters, lowercase letters, and numbers
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-200 mb-2">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-gray-800 border border-gray-700 pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Confirm your new password"
              />
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={loading || !resetToken}
            className="w-full text-slate-100 border-transparent bg-blue-600 hover:bg-blue-700 py-2 px-4 mb-4"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>
      )}
      
      <div className="mt-4 text-center">
        <Button
          onClick={() => navigate('/signin')}
          className="text-blue-400 hover:text-blue-300"
        >
          Back to Sign In
        </Button>
      </div>
    </div>
  );
};

export default ResetPassword;