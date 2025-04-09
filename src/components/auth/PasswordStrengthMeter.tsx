// components/auth/PasswordStrengthMeter.tsx
import React from 'react';
import { PasswordStrength, PasswordRequirement } from './types';
import { getPasswordRequirements } from './utils';

interface PasswordStrengthMeterProps {
  password: string;
  strength: PasswordStrength;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  strength 
}) => {
  const requirements = getPasswordRequirements(password);

  // Color based on strength
  const getStrengthColor = (): string => {
    switch (strength) {
      case 'weak':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'strong':
        return 'text-green-400';
      default:
        return 'text-red-400';
    }
  };

  // Width of progress bar based on strength
  const getStrengthWidth = (): string => {
    switch (strength) {
      case 'weak':
        return 'w-1/3 bg-red-500';
      case 'medium':
        return 'w-2/3 bg-yellow-500';
      case 'strong':
        return 'w-full bg-green-500';
      default:
        return 'w-0';
    }
  };

  return (
    <div className="mt-3">
      {/* Strength indicator bar */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-1.5 flex-1 rounded-full bg-[#0c1629] overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthWidth()}`}
          />
        </div>
        <span className={`text-xs font-medium ${getStrengthColor()}`}>
          {strength === 'weak' ? 'Weak' : 
           strength === 'medium' ? 'Medium' : 'Strong'}
        </span>
      </div>
      
      {/* Requirements */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
        {requirements.map((req, index) => (
          <span key={index} className={req.isMet ? "text-green-400" : ""}>
            ✓ {req.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;