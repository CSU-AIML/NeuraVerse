import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  icon: LucideIcon;
  rightElement?: React.ReactNode;
  error?: string;
  autoComplete?: string;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  rightElement,
  error,
  autoComplete,
  className = "",
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-300 mb-2 font-medium">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#3461FF]" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full rounded-lg bg-[#142241]/60 border border-[#3461FF]/30 pl-10 ${rightElement ? 'pr-10' : 'pr-4'} py-2 text-white focus:outline-none focus:border-[#3461FF]/70 ${className} ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};