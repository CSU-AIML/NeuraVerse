// components/auth/SignUpForm.tsx
import React, { useState, useEffect } from 'react';
import { Mail, Lock, UserPlus, User } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { AuthFormProps, PasswordStrength } from './types';
import { calculatePasswordStrength } from './utils';
import AuthInput from './AuthInput';
import AuthMessage from './AuthMessage';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import AuthInfoBox from './AuthInfoBox';

const SignUpForm: React.FC<AuthFormProps> = ({ onSuccess, onError, onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signUp } = useAuth();

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Input validation
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }
  
    setLoading(true);
  
    try {
      // Use the signUp function from AuthContext
      const { error } = await signUp(email, password);

      if (error) {
        throw error;
      }
      
      setSuccessMessage('Account created successfully! You can now sign in.');
      
      // Switch back to sign in form after successful signup
      setTimeout(() => {
        if (onToggleForm) onToggleForm('signin');
      }, 2000);
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Check for common errors
      if (err.message.includes('already registered')) {
        setErrorMessage('This email is already registered. Please sign in instead.');
      } else {
        setErrorMessage(err.message || 'An error occurred during sign up');
      }
      
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInToggle = () => {
    if (onToggleForm) onToggleForm('signin');
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
        
        <div className="mb-4">
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a strong password"
            icon={<Lock />}
            autoComplete="new-password"
            showPassword={showPassword}
            togglePassword={togglePassword}
          />
          
          {/* Password strength meter */}
          <PasswordStrengthMeter 
            password={password} 
            strength={passwordStrength} 
          />
        </div>
        
        {/* Account info box */}
        <AuthInfoBox 
          icon={<User className="w-5 h-5" />}
          title="Account Information"
          description="Create your account to access AI/ML tools and collaborate on projects with your team."
        />
        
        <Button
          type="submit"
          disabled={loading || passwordStrength === 'weak'}
          className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-4 mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            {loading ? 'Creating Account...' : 'Sign Up'}
          </div>
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={handleSignInToggle}
          className="text-[#3461FF] hover:text-[#4F46E5] text-sm"
        >
          Already have an account? Sign In
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-[#3461FF]/20">
        <p className="text-sm text-gray-400 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;