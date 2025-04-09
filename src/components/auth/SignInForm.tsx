// components/auth/SignInForm.tsx
import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AuthFormProps } from './types';
import AuthInput from './AuthInput';
import AuthMessage from './AuthMessage';

const SignInForm: React.FC<AuthFormProps> = ({ onSuccess, onError, onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Load remembered email if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // Use the signIn function from AuthContext
      const { error } = await signIn(email, password);

      if (error) {
        throw error;
      }
      
      // Handle "Remember me" preference
      if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }
      
      setSuccessMessage('Sign in successful');
      
      // Redirect to dashboard
      navigate('/dashboard');
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error signing in:', err);
      
      // User-friendly error message
      setErrorMessage('Invalid email or password. Please try again.');
      
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onToggleForm) onToggleForm('reset');
  };

  const handleSignUpToggle = () => {
    if (onToggleForm) onToggleForm('signup');
  };

  return (
    <div>
      <AuthMessage type="error" message={errorMessage} />
      <AuthMessage type="success" message={successMessage} />
      
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail />}
          autoComplete="email"
        />
        
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon={<Lock />}
          autoComplete="current-password"
          showPassword={showPassword}
          togglePassword={togglePassword}
        />
        
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
            onClick={handleForgotPassword}
            className="text-sm text-[#3461FF] hover:text-[#4F46E5]"
          >
            Forgot password?
          </button>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-4 mb-4"
        >
          <div className="flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" />
            {loading ? 'Signing In...' : 'Sign In'}
          </div>
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={handleSignUpToggle}
          className="text-[#3461FF] hover:text-[#4F46E5] text-sm"
        >
          Need an account? Sign Up
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-[#3461FF]/20">
        <p className="text-sm text-gray-400 text-center">
          Sign in to manage AI/ML projects and collaborate with your team
        </p>
      </div>
    </div>
  );
};

export default SignInForm;