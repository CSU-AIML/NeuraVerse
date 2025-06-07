// src/SignIn.tsx - Minimal Horizontal Design with Silk Background
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Chrome, AlertCircle } from 'lucide-react';
import PixelCard from './components/ui/PixelCard';

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    signIn, 
    signInWithGoogle, 
    signInWithGoogleRedirect, 
    signUp, 
    loading, 
    error, 
    isAuthenticated 
  } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  // Load saved email if "remember me" was used previously
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedRememberMe = localStorage.getItem('remember_me') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirectTo = new URLSearchParams(location.search).get('redirectTo') || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          error = 'Invalid email format';
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        // Also validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setValidationErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
        break;
      case 'confirmPassword':
        if (value && formData.password && value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'displayName':
        if (isSignUp && value && value.length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return false;
    }

    if (isSignUp) {
      if (!formData.displayName) {
        setFormError('Display name is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRememberMe = () => {
    if (rememberMe && formData.email) {
      localStorage.setItem('remembered_email', formData.email);
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('auth_persistence', 'local');
    } else {
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remember_me');
      localStorage.setItem('auth_persistence', 'session');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setFormError(null);
      handleRememberMe();

      if (isSignUp) {
        await signUp(formData.email, formData.password, {
          displayName: formData.displayName,
          display_name: formData.displayName,
        });
        
        setFormData({
          email: rememberMe ? formData.email : '',
          password: '',
          confirmPassword: '',
          displayName: '',
        });
      } else {
        await signIn(formData.email, formData.password, rememberMe);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      let errorMessage = error.message || 'Authentication failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      setFormError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setFormError(null);

      if (rememberMe) {
        localStorage.setItem('auth_persistence', 'local');
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.setItem('auth_persistence', 'session');
        localStorage.removeItem('remember_me');
      }

      try {
        await signInWithGoogle();
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          await signInWithGoogleRedirect();
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      let errorMessage = 'Google sign in failed';
      
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups and try again.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please wait and try again.';
          break;
        default:
          errorMessage = error.message || 'Google sign in failed';
      }
      
      setFormError(errorMessage);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormError(null);
    setValidationErrors({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
    setFormData(prev => ({
      email: prev.email,
      password: '',
      confirmPassword: '',
      displayName: '',
    }));
  };

  if (loading && isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
        <div className="text-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 z-10">
          <div className="w-8 h-8 border-4 border-t-indigo-400 border-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/90 mb-2">Welcome back!</p>
          <p className="text-white/60 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex relative overflow-hidden">
      
      {/* Main Container */}
      <div className="w-full h-full flex items-center justify-center p-8 relative z-10">
        {/* Glassmorphism Container */}
        <div className="w-full max-w-6xl h-full max-h-[600px] bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden">
          
          {/* Left Panel - Branding with Full PixelCard Coverage */}
          <PixelCard variant="blue" className="hidden lg:block lg:w-1/2 rounded-l-3xl overflow-hidden h-full min-h-[600px] m-0 p-0">
            <div className="absolute inset-0 flex flex-col justify-center items-center p-12 bg-gradient-to-br from-white/5 to-transparent z-10">
              <div className="text-center">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                  NeuraVerse
                </h1>
                <p className="text-xl text-white/70 mb-8 max-w-md leading-relaxed">
                  Step into the future of artificial intelligence and unlock limitless possibilities
                </p>
                <div className="w-20 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto"></div>
              </div>
            </div>
          </PixelCard>

          {/* Right Panel - Form */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-8">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                NeuraVerse
              </h1>
              <p className="text-white/60 text-sm">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </p>
            </div>

            {/* Error Alert */}
            {(formError || error) && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-xs">{formError || error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name (Sign Up only) */}
              {isSignUp && (
                <div className="space-y-1">
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 transition-all backdrop-blur-xl ${
                      validationErrors.displayName 
                        ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                        : formData.displayName && !validationErrors.displayName
                        ? 'border-green-400/50 focus:border-green-400 focus:ring-green-400/20'
                        : 'border-white/10 focus:border-indigo-400/50 focus:ring-indigo-400/20'
                    }`}
                    placeholder="Display Name"
                    required={isSignUp}
                  />
                  {validationErrors.displayName && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.displayName}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 transition-all backdrop-blur-xl ${
                      validationErrors.email 
                        ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                        : formData.email && !validationErrors.email
                        ? 'border-green-400/50 focus:border-green-400 focus:ring-green-400/20'
                        : 'border-white/10 focus:border-indigo-400/50 focus:ring-indigo-400/20'
                    }`}
                    placeholder="Email Address"
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 transition-all backdrop-blur-xl ${
                      validationErrors.password 
                        ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                        : formData.password && !validationErrors.password && formData.password.length >= 6
                        ? 'border-green-400/50 focus:border-green-400 focus:ring-green-400/20'
                        : 'border-white/10 focus:border-indigo-400/50 focus:ring-indigo-400/20'
                    }`}
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                )}
                {!validationErrors.password && formData.password && formData.password.length >= 6 && (
                  <p className="text-green-400 text-xs mt-1">✓ Password strength good</p>
                )}
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 transition-all backdrop-blur-xl ${
                        validationErrors.confirmPassword 
                          ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                          : formData.confirmPassword && !validationErrors.confirmPassword && formData.confirmPassword === formData.password
                          ? 'border-green-400/50 focus:border-green-400 focus:ring-green-400/20'
                          : 'border-white/10 focus:border-indigo-400/50 focus:ring-indigo-400/20'
                      }`}
                      placeholder="Confirm Password"
                      required={isSignUp}
                    />
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                  {!validationErrors.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.password && (
                    <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>
                  )}
                </div>
              )}

              {/* Remember Me (Sign In only) */}
              {!isSignUp && (
                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3 h-3 text-indigo-400 bg-white/5 border-white/20 rounded focus:ring-indigo-400/20 focus:ring-1"
                    />
                    <span className="text-white/60 text-xs">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium text-sm rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isSignUp ? 'Creating...' : 'Signing in...'}
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>

              {/* Google Sign In */}
              {!isSignUp && (
                <>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-transparent text-white/40 text-xs">or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-xl"
                  >
                    <Chrome className="w-4 h-4" />
                    Continue with Google
                  </button>
                </>
              )}
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-white/60 text-xs">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={toggleMode}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-3 text-center">
              <Link
                to="/"
                className="text-white/40 hover:text-white/60 text-xs transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}