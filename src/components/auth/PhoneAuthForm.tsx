// components/auth/PhoneAuthForm.tsx
import React, { useState, useRef } from 'react';
import { Phone, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { setupRecaptcha, sendOtp, verifyOtp } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import AuthInput from './AuthInput';
import AuthMessage from './AuthMessage';

enum AuthStep {
  PHONE_INPUT,
  OTP_VERIFICATION
}

const PhoneAuthForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<AuthStep>(AuthStep.PHONE_INPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // Format phone number with country code
  const formatPhoneNumber = (number: string) => {
    // Remove any non-digit characters
    const cleaned = number.replace(/\D/g, '');

    // Add + prefix if not present
    if (!number.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return number;
  };
  
  // Handle phone number input change
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setFormattedPhoneNumber(formatPhoneNumber(value));
  };

  // Send OTP to phone number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!formattedPhoneNumber || formattedPhoneNumber.length < 8) {
        throw new Error('Please enter a valid phone number');
      }

      // Setup recaptcha if it doesn't exist yet
      const appVerifier = setupRecaptcha('recaptcha-container');
      
      // Send OTP to phone number
      const { confirmationResult: result, error: sendError } = await sendOtp(formattedPhoneNumber, appVerifier);
      
      if (sendError) {
        throw new Error(`Error sending OTP: ${sendError.message}`);
      }
      
      if (!result) {
        throw new Error('Failed to send verification code. Please try again.');
      }
      
      setConfirmationResult(result);
      setStep(AuthStep.OTP_VERIFICATION);
      setSuccess('Verification code sent successfully!');
      
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!otp || otp.length < 4) {
        throw new Error('Please enter a valid verification code');
      }
      
      if (!confirmationResult) {
        throw new Error('Verification session expired. Please try again.');
      }
      
      // Verify OTP
      const { user, error: verifyError } = await verifyOtp(confirmationResult, otp);
      
      if (verifyError) {
        throw new Error(`Error verifying code: ${verifyError.message}`);
      }
      
      if (!user) {
        throw new Error('Verification failed. Please try again.');
      }
      
      setSuccess('Phone number verified successfully! Redirecting...');
      
      // Refresh user data
      await refreshUser();
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form to phone input
  const handleBack = () => {
    setStep(AuthStep.PHONE_INPUT);
    setError(null);
    setSuccess(null);
    setOtp('');
  };

  return (
    <div className="w-full max-w-md p-6 mx-auto">
      {/* Error and success messages */}
      <AuthMessage type="error" message={error} />
      <AuthMessage type="success" message={success} />
      
      {/* Phone number input step */}
      {step === AuthStep.PHONE_INPUT && (
        <form onSubmit={handleSendOtp}>
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In with Phone</h2>
          
          <AuthInput
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="+1 234 567 8900"
            icon={<Phone />}
            autoComplete="tel"
          />
          
          <div className="mb-4 text-sm text-gray-400">
            Please enter your phone number with country code (e.g., +1 for US)
          </div>
          
          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container" ref={recaptchaRef}></div>
          
          <Button
            type="submit"
            disabled={loading || !phoneNumber}
            className="w-full bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-4 mt-4"
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowRight className="w-5 h-5" />
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </div>
          </Button>
        </form>
      )}
      
      {/* OTP verification step */}
      {step === AuthStep.OTP_VERIFICATION && (
        <form onSubmit={handleVerifyOtp}>
          <h2 className="text-2xl font-bold mb-6 text-center">Enter Verification Code</h2>
          
          <div className="mb-4 text-center">
            <p className="text-gray-300">
              We sent a verification code to
            </p>
            <p className="font-bold text-lg text-white">
              {formattedPhoneNumber}
            </p>
          </div>
          
          <AuthInput
            label="Verification Code"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
          />
          
          <div className="flex space-x-4 mt-6">
            <Button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-none py-2 px-4"
              disabled={loading}
            >
              Back
            </Button>
            
            <Button
              type="submit"
              disabled={loading || !otp || otp.length < 6}
              className="flex-1 bg-[#3461FF] hover:bg-[#2D3FFF] text-white border-none py-2 px-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                {loading ? 'Verifying...' : 'Verify'}
              </div>
            </Button>
          </div>
          
          <div className="mt-6 text-sm text-center text-gray-400">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-[#3461FF] hover:text-[#4F46E5] text-sm font-medium"
              disabled={loading}
            >
              Resend Code
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PhoneAuthForm;