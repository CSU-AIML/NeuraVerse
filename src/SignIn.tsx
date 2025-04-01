import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, User, ShieldCheck, ChevronRight, Braces, Server, Users } from 'lucide-react';
import { TypingAnimation } from './components/magicui/typing-animation';
import { Button } from './components/ui/button';
import { useAuth } from './contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ripple } from './components/magicui/ripple'; // Import the ripple component

interface SignInProps {
  onSuccess?: () => void;
}

export function SignIn({ onSuccess }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isSetNewPassword, setIsSetNewPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, refreshUser } = useAuth();

  

  const checkForResetToken = () => {
    const currentUrl = window.location.href;
    console.log("Checking URL for reset token:", currentUrl);
    
    // Check for reset token in various parts of the URL (hash, query params, etc.)
    let hasResetToken = false;
    
    // Check hash for access_token
    if (window.location.hash && window.location.hash.includes('access_token=') && window.location.hash.includes('type=recovery')) {
      hasResetToken = true;
      console.log("Reset token found in hash");
    }
    
    // Check query params for access_token
    if (window.location.search && window.location.search.includes('access_token=')) {
      hasResetToken = true;
      console.log("Reset token found in search params");
    }
    
    // If we're in signin but have a token, redirect to reset-password
    if (hasResetToken && window.location.pathname.includes('/signin')) {
      console.log("Redirecting to reset password page with URL:", currentUrl);
      
      // Preserve the full URL including the token
      window.location.href = `/reset-password${window.location.search}${window.location.hash}`;
      return true;
    }
    
    return false;
  };

  // Check URL for reset token on component mount
  useEffect(() => {
    // Check if we need to redirect to reset-password page
    if (checkForResetToken()) {
      return; // Stop execution if redirecting
    }
    
    // Get the hash fragment from the URL
    const hash = location.hash;
    
    // Debug the URL parameters
    console.log("URL hash:", hash);
    console.log("URL params:", location.search);
    console.log("Full URL:", window.location.href);
    
    // Rest of your existing code for handling recovery token in SignIn
    if (hash && hash.includes('access_token=') && hash.includes('type=recovery')) {
      console.log("Reset token found in URL, showing password reset form");
      setIsSetNewPassword(true);
      setIsResetPassword(false);
      setShowSignUp(false);
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

  // Clear messages when switching between forms
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [showSignUp, isResetPassword, isSetNewPassword]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await signIn(email, password);

      if (error) throw error;
      
      console.log('Sign in successful');
      
      // Store auth in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }
      
      // Refresh user data to ensure we have the latest role information
      await refreshUser();
      
      // Redirect to dashboard after successful login
      navigate('/dashboard');
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Set redirect URL for email verification
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Setting redirect URL to:", redirectUrl);

      // Sign up user with regular user role only (no admin option)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'user' // Always set to 'user'
          },
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;
      
      console.log('Sign up successful:', data);
      
      // Directly set the user role in the user_profiles table
      if (data.user) {
        // Create/update the user profile with the 'user' role
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert([
            { 
              id: data.user.id,
              role: 'user', // Always set to 'user'
              display_name: email.split('@')[0] || 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
          
        if (profileError) {
          console.error('Error setting user profile:', profileError);
          // Continue anyway - the user will be created with the default role
        }
      }
      
      setSuccessMessage('Please check your email to confirm your account');
      
      // Switch back to sign in form after successful signup
      setTimeout(() => {
        setShowSignUp(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error signing up:', err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Set redirect URL for password reset
      const resetRedirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Setting reset redirect URL to:", resetRedirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectUrl,
      });

      if (error) throw error;
      
      console.log('Password reset email sent successfully');
      setSuccessMessage('Password reset instructions sent to your email');
      
      // Switch back to sign in form after successful password reset request
      setTimeout(() => {
        setIsResetPassword(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
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
    setSuccessMessage(null);
    
    try {
      // Update the user's password - Supabase will use the token from the URL
      const { error } = await supabase.auth.updateUser({ 
        password 
      });

      if (error) throw error;
      
      // Log security event
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          await supabase
            .from('security_events')
            .insert({
              event_type: 'password_reset',
              user_id: user.user.id,
              details: {
                reset_completed: true,
                user_agent: navigator.userAgent
              }
            });
        }
      } catch (logError) {
        console.error('Error logging security event:', logError);
      }
      
      setSuccessMessage('Your password has been successfully reset');
      
      // Remove the hash from the URL to avoid token reuse
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Switch back to sign in form after a delay
      setTimeout(() => {
        setIsSetNewPassword(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error setting new password:', err);
      setError(err.message || 'Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Split layout with info on left, login on right
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0b1121]">
      {/* LEFT SIDE - App info and background with ripple/gradient effects */}
      <div className="lg:w-5/12 relative overflow-hidden p-8 flex flex-col">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0b1121] via-[#142241] to-[#0b1121]"></div>
          <div className="absolute blur-3xl opacity-20 top-20 left-20 w-80 h-80 bg-[#3461FF] rounded-full animate-blob"></div>
          <div className="absolute blur-3xl opacity-20 bottom-40 left-40 w-96 h-96 bg-[#5D3FD3] rounded-full animate-blob animation-delay-2000"></div>
          
          {/* Add the Ripple component in the background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Ripple 
              mainCircleSize={300}
              mainCircleOpacity={0.07}
              numCircles={8}
              className="z-[1] [&>div]:!bg-[#3461FF]/10 [&>div]:!border-[#3461FF]/20"
            />
          </div>
        </div>
        
        {/* NeuraVerse logo and information */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/white_logo.png" 
              alt="NeuraVerse Logo" 
              className="h-12" 
              onError={(e) => {
                console.error('Failed to load logo');
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          {/* Main heading with typing animation */}
          <div className="mb-8">
            <TypingAnimation 
              className="text-3xl font-bold text-white mb-4"
              duration={40}
              as="h1"
            >
              Manage AI/ML Projects with Ease
            </TypingAnimation>
            <p className="text-gray-300 text-lg">
              Your unified platform for developing, deploying, and monitoring AI/ML solutions
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="space-y-6 mb-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-[#3461FF]/20 flex-shrink-0">
                <Braces className="w-6 h-6 text-[#3461FF]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Unified Workspace</h3>
                <p className="text-gray-300">Access all your AI/ML projects in one place with integrated tools and services</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-[#5D3FD3]/20 flex-shrink-0">
                <Server className="w-6 h-6 text-[#5D3FD3]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Seamless Deployment</h3>
                <p className="text-gray-300">Deploy models to production with one click and monitor performance in real time</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-[#2D3FFF]/20 flex-shrink-0">
                <Users className="w-6 h-6 text-[#2D3FFF]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Team Collaboration</h3>
                <p className="text-gray-300">Work together with your team on complex AI/ML projects with version control</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="pt-8 mt-6 border-t border-[#3461FF]/20">
            <p className="text-gray-400 text-sm">
              © 2025 NeuraVerse • Your Gateway to AI Development
            </p>
          </div>
        </div>
      </div>
      
      {/* RIGHT SIDE - Login/Signup forms */}
      <div className="lg:w-7/12 flex items-center justify-center p-4 relative">
        {/* Subtle background blur/gradient */}
        <div className="absolute inset-0 bg-[#0b1121]/90 backdrop-blur-sm"></div>
        
        {/* Render password reset form */}
        {isResetPassword && (
          <div className="max-w-md w-full mx-auto bg-[#0b1121]/40 backdrop-blur-xl p-8 rounded-lg shadow-xl border border-[#3461FF]/20 relative z-10">
            <TypingAnimation 
              className="text-2xl font-bold mb-6 text-center text-white"
              duration={40}
              as="h2"
            >
              Reset Password
            </TypingAnimation>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-md text-red-200">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-[#3461FF]/20 border border-[#3461FF]/30 rounded-md text-blue-200">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleResetPassword}>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg bg-[#142241]/60 border border-[#3461FF]/30 pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#3461FF]/70"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-4 mb-4"
              >
                {loading ? 'Processing...' : 'Send Reset Instructions'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsResetPassword(false)}
                className="text-[#3461FF] hover:text-[#4F46E5] text-sm"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Render set new password form (after clicking link in email) */}
        {isSetNewPassword && (
          <div className="max-w-md w-full mx-auto bg-[#0b1121]/40 backdrop-blur-xl p-8 rounded-lg shadow-xl border border-[#3461FF]/20 relative z-10">
            <TypingAnimation 
              className="text-2xl font-bold mb-6 text-center text-white"
              duration={40}
              as="h2"
            >
              Create New Password
            </TypingAnimation>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-md text-red-200">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-[#3461FF]/20 border border-[#3461FF]/30 rounded-md text-blue-200">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSetNewPassword}>
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
                
                {/* Enhanced Password strength indicator */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-1.5 flex-1 rounded-full bg-[#0c1629] overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === 'weak' ? 'bg-red-500 w-1/3' : 
                          passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'weak' ? 'text-red-400' : 
                      passwordStrength === 'medium' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {passwordStrength === 'weak' ? 'Weak' : 
                      passwordStrength === 'medium' ? 'Medium' : 'Strong'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span className={password.length >= 8 ? "text-green-400" : ""}>
                      ✓ 8+ characters
                    </span>
                    <span className={/[A-Z]/.test(password) ? "text-green-400" : ""}>
                      ✓ Uppercase
                    </span>
                    <span className={/[a-z]/.test(password) ? "text-green-400" : ""}>
                      ✓ Lowercase
                    </span>
                    <span className={/[0-9]/.test(password) ? "text-green-400" : ""}>
                      ✓ Number
                    </span>
                  </div>
                </div>
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
                disabled={!!loading || (!!confirmPassword && password !== confirmPassword)}
                className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-3 px-4 mb-4 rounded-lg text-base font-medium transition-all duration-200 shadow-lg shadow-[#3461FF]/20 hover:shadow-[#3461FF]/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    Setting Password...
                  </span>
                ) : (
                  'Set New Password'
                )}
              </Button>
            </form>
            
            {/* Back to sign in button only appears after success */}
            {successMessage && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsSetNewPassword(false);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="text-[#3461FF] hover:text-[#4F46E5] text-sm"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {/* Regular sign in / sign up form */}
        {!isResetPassword && !isSetNewPassword && (
          <div className="max-w-md w-full mx-auto bg-[#0b1121]/40 backdrop-blur-xl p-8 rounded-lg shadow-xl border border-[#3461FF]/20 relative z-10">
            <TypingAnimation 
              className="text-2xl font-bold mb-6 text-center text-white"
              duration={40}
              as="h2"
            >
              {showSignUp ? 'Create an Account' : 'Welcome to NeuraVerse'}
            </TypingAnimation>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-md text-red-200">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-[#3461FF]/20 border border-[#3461FF]/30 rounded-md text-blue-200">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={showSignUp ? handleSignUp : handleSignIn}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg bg-[#142241]/60 border border-[#3461FF]/30 pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#3461FF]/70"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg bg-[#142241]/60 border border-[#3461FF]/30 pl-10 pr-10 py-2 text-white focus:outline-none focus:border-[#3461FF]/70"
                    placeholder={showSignUp ? "Choose a strong password" : "Enter your password"}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Account information for signup */}
              {showSignUp && (
                <div className="mb-6">
                  <div className="p-4 rounded-lg border border-[#3461FF]/20 bg-[#3461FF]/10">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-[#3461FF]" />
                      <h3 className="text-sm font-medium text-blue-300">Account Information</h3>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Create your NeuraVerse account to access cutting-edge AI/ML tools and collaborate on projects with your team.
                    </p>
                  </div>
                </div>
              )}

              {!showSignUp && (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-[#3461FF]/30 bg-[#142241]/60 text-[#3461FF] focus:ring-[#3461FF]/30"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className="text-sm text-[#3461FF] hover:text-[#4F46E5]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-4 mb-4"
              >
                <div className="flex items-center justify-center gap-2">
                  {showSignUp ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      {loading ? 'Signing In...' : 'Sign In'}
                    </>
                  )}
                </div>
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowSignUp(!showSignUp)}
                className="text-[#3461FF] hover:text-[#4F46E5] text-sm"
              >
                {showSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#3461FF]/20">
              <p className="text-sm text-gray-400 text-center">
                {showSignUp 
                  ? 'By signing up, you agree to our Terms of Service and Privacy Policy' 
                  : 'Sign in to manage AI/ML projects and collaborate with your team'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}