// components/auth/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { TypingAnimation } from '../magicui/typing-animation';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { parseResetToken, clearUrlTokens } from './utils';
import AuthMessage from './AuthMessage';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { PasswordStrength } from './types';
import { AuthService } from '../../lib/auth-service';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Parse the reset token from URL on component mount
  useEffect(() => {
    console.log("Full URL:", window.location.href);
    
    // Check if we have a valid reset token
    const hasToken = parseResetToken();
    
    if (hasToken) {
      // Extract the token from URL (either hash or query params)
      let token = null;
      
      if (location.hash) {
        const hashParams = new URLSearchParams(location.hash.replace('#', ''));
        token = hashParams.get('access_token');
      }
      
      if (!token && location.search) {
        const queryParams = new URLSearchParams(location.search);
        token = queryParams.get('access_token');
      }
      
      if (!token) {
        const fullUrl = window.location.href;
        const tokenMatch = fullUrl.match(/access_token=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) {
          token = tokenMatch[1];
        }
      }
      
      setResetToken(token);
      console.log("Reset token found and set");
    } else {
      setError('Invalid or missing password reset token. Please request a new password reset link.');
      console.error("No token found in URL");
      
      // Redirect back to sign in after a delay
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    }
  }, [location, navigate]);

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
      
      // Use our AuthService to update the password
      const { error } = await AuthService.updatePassword(password);

      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Password updated successfully");
      
      // Remove hash from URL to prevent token reuse
      clearUrlTokens();
      
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
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto bg-[#0b1121]/80 backdrop-blur-xl p-8 rounded-lg shadow-xl border border-[#3461FF]/20">
        <TypingAnimation 
          className="text-2xl font-bold mb-6 text-center text-white"
          duration={40}
          as="h2"
        >
          Reset Your Password
        </TypingAnimation>
        
        <AuthMessage type="error" message={error} />
        <AuthMessage type="success" message={successMessage} />
        
        {!successMessage && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#3461FF]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-[#0c1629]/80 border border-[#3461FF]/30 pl-10 pr-10 py-3 text-white focus:outline-none focus:border-[#3461FF] focus:ring-1 focus:ring-[#3461FF]/50 transition-all duration-200"
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength meter */}
              <PasswordStrengthMeter 
                password={password} 
                strength={passwordStrength} 
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">Confirm Password</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#3461FF]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full rounded-lg bg-[#0c1629]/80 border pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 transition-all duration-200 ${
                    confirmPassword && password !== confirmPassword 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" 
                      : "border-[#3461FF]/30 focus:border-[#3461FF] focus:ring-[#3461FF]/50"
                  }`}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    <span className="text-xs">Passwords don't match</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading || !resetToken || passwordStrength === 'weak' || password !== confirmPassword}
              className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-3 px-4 mb-4 rounded-lg text-base font-medium transition-all duration-200 shadow-lg shadow-[#3461FF]/20 hover:shadow-[#3461FF]/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                  Resetting Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/signin')}
            className="text-[#3461FF] hover:text-[#4F46E5] text-sm"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;