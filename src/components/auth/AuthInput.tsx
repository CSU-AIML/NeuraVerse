// components/auth/AuthInput.tsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  icon: React.ReactNode;
  autoComplete?: string;
  error?: string;
  showPassword?: boolean;
  togglePassword?: () => void;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  type,
  value,
  onChange,
  required = true,
  placeholder,
  icon,
  autoComplete,
  error,
  showPassword,
  togglePassword
}) => {
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      <label className="block text-gray-300 mb-2 font-medium">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#3461FF]">
          {icon}
        </div>
        
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-lg bg-[#0c1629]/80 border pl-10 ${isPasswordType ? 'pr-10' : 'pr-4'} py-3 text-white focus:outline-none focus:border-[#3461FF] focus:ring-1 focus:ring-[#3461FF]/50 transition-all duration-200 ${
            error ? 'border-red-500' : 'border-[#3461FF]/30'
          }`}
        />
        
        {isPasswordType && togglePassword && (
          <button 
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        
        {error && (
          <div className="absolute -bottom-5 left-0 text-red-500 text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthInput;