import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResetPasswordComponent from './auth/ResetPassword';

/**
 * Main ResetPassword component that renders the auth reset password form
 * This component maintains the original file path but uses the updated component
 */
const ResetPassword: React.FC = () => {
  return <ResetPasswordComponent />;
};

export default ResetPassword;