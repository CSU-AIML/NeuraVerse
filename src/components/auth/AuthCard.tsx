// components/auth/AuthCard.tsx
import React from 'react';
import { TypingAnimation } from '../magicui/typing-animation';
import { AuthFormType } from './types';

interface AuthCardProps {
  title: string;
  formType: AuthFormType;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, formType, children }) => {
  return (
    <div className="max-w-md w-full mx-auto bg-[#0b1121]/40 backdrop-blur-xl p-8 rounded-lg shadow-xl border border-[#3461FF]/20 relative z-10">
      <TypingAnimation 
        className="text-2xl font-bold mb-6 text-center text-white"
        duration={40}
        as="h2"
      >
        {title}
      </TypingAnimation>
      
      {children}
    </div>
  );
};

export default AuthCard;