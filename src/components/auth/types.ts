// components/auth/types.ts
export type AuthFormType = 'signin' | 'signup' | 'reset' | 'new-password';

export interface AuthFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onToggleForm?: (formType: AuthFormType) => void;
}

export interface FormValues {
  email: string;
  password: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordRequirement {
  text: string;
  isMet: boolean;
}

export interface AuthFormState {
  loading: boolean;
  error: string | null;
  success: string | null;
}