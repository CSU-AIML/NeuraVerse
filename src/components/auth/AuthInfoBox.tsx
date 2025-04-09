// components/auth/AuthInfoBox.tsx
import React from 'react';

interface AuthInfoBoxProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AuthInfoBox: React.FC<AuthInfoBoxProps> = ({ icon, title, description }) => {
  return (
    <div className="mb-6">
      <div className="p-4 rounded-lg border border-[#3461FF]/20 bg-[#3461FF]/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-[#3461FF]">
            {icon}
          </div>
          <h3 className="text-sm font-medium text-blue-300">{title}</h3>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default AuthInfoBox;