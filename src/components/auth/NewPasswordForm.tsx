// components/auth/NewPasswordForm.tsx
import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { AuthFormProps, AuthFormState, PasswordStrength } from './types';
import { calculatePasswordStrength, clearUrlTokens, passwordsMatch } from './utils';
import AuthInput from './AuthInput';
import AuthMessage from './AuthMessage';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const NewPasswordForm: React.FC<AuthFormProps> = ({ onSuccess, onError, onToggleForm }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [formState, setFormState] = useState<AuthFormState>({
    loading: false,
    error: null,
    success: null
  });

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!passwordsMatch(password, confirmPassword)) {
      setFormState({
        loading: false,
        error: 'Passwords do not match',
        success: null
      });
      return;
    }

    if (password.length < 8) {
      setFormState({
        loading: false,
        error: 'Password must be at least 8 characters long',
        success: null
      });
      return;
    }

    if (passwordStrength === 'weak') {
      setFormState({
        loading: false,
        error: 'Please choose a stronger password',
        success: null
      });
      return;
    }

    setFormState({
      loading: true,
      error: null,
      success: null
    });
    
    try {
      // Update the user's password - Supabase will use the token from the URL
      const { error } = await supabase.auth.updateUser({ 
        password 
      });

      if (error) throw new Error(error.message);
      
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
      
      setFormState({
        loading: false,
        error: null,
        success: 'Your password has been successfully reset'
      });
      
      // Remove the hash from the URL to avoid token reuse
      clearUrlTokens();
      
      // Switch back to sign in form after a delay
      setTimeout(() => {
        if (onToggleForm) onToggleForm('signin');
      }, 3000);
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Error resetting password. Please try again.';
      setFormState({
        loading: false,
        error: errorMessage,
        success: null
      });
      
      if (onError) onError(errorMessage);
    }
  };

  const passwordMatchError = confirmPassword && !passwordsMatch(password, confirmPassword) 
    ? 'Passwords do not match' 
    : undefined;

  return (
    <div>
      <AuthMessage type="error" message={formState.error} />
      <AuthMessage type="success" message={formState.success} />
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <AuthInput
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
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
        
        <AuthInput
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          icon={<ShieldCheck />}
          autoComplete="new-password"
          showPassword={showPassword}
          togglePassword={togglePassword}
          error={passwordMatchError}
        />
        
        <Button
          type="submit"
          disabled={formState.loading || passwordStrength === 'weak' || password !== confirmPassword}
          className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-3 px-4 mb-4 rounded-lg text-base font-medium transition-all duration-200 shadow-lg shadow-[#3461FF]/20 hover:shadow-[#3461FF]/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {formState.loading ? (
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
      {formState.success && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              clearUrlTokens();
              if (onToggleForm) onToggleForm('signin');
            }}
            className="text-[#3461FF] hover:text-[#4F46E5] text-sm"
          >
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default NewPasswordForm;