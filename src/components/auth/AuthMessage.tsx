// components/auth/AuthMessage.tsx
import React from 'react';

interface AuthMessageProps {
  type: 'error' | 'success';
  message: string | null;
}

const AuthMessage: React.FC<AuthMessageProps> = ({ type, message }) => {
  if (!message) return null;
  
  const styles = {
    error: 'bg-red-900/30 border-red-500/30 text-red-200',
    success: 'bg-[#3461FF]/20 border-[#3461FF]/30 text-blue-200'
  };
  
  return (
    <div className={`mb-4 p-3 border rounded-md ${styles[type]}`}>
      {message}
    </div>
  );
};

export default AuthMessage;