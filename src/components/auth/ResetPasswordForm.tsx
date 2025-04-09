// components/auth/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { AuthFormProps } from './types';
import AuthInput from './AuthInput';
import AuthMessage from './AuthMessage';

const ResetPasswordForm: React.FC<AuthFormProps> = ({ onSuccess, onError, onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        throw error;
      }
      
      setSuccessMessage('Password reset instructions have been sent to your email');
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setErrorMessage('There was a problem sending the reset instructions. Please try again.');
      
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
      
      {!successMessage ? (
        <form onSubmit={handleSubmit}>
          <p className="text-gray-300 mb-6">
            Enter your email address, and we'll send you instructions to reset your password.
          </p>
          
          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={<Mail />}
            autoComplete="email"
          />
          
          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-4 mb-4"
          >
            {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          onClick={handleSignInToggle}
          className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-4 mb-4"
        >
          Return to Sign In
        </Button>
      )}
      
      <div className="mt-4 text-center">
        <button
          onClick={handleSignInToggle}
          className="text-[#3461FF] hover:text-[#4F46E5] text-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordForm;