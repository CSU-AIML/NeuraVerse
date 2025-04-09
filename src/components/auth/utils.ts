// components/auth/utils.ts
import { PasswordStrength, PasswordRequirement } from './types';

/**
 * Calculate password strength based on requirements
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password || password.length < 8) {
    return 'weak';
  } else if (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    password.length >= 8
  ) {
    return 'strong';
  } else {
    return 'medium';
  }
};

/**
 * Check if passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Get password requirements and their status
 */
export const getPasswordRequirements = (password: string): PasswordRequirement[] => {
  return [
    {
      text: '8+ characters',
      isMet: password.length >= 8
    },
    {
      text: 'Uppercase',
      isMet: /[A-Z]/.test(password)
    },
    {
      text: 'Lowercase',
      isMet: /[a-z]/.test(password)
    },
    {
      text: 'Number',
      isMet: /[0-9]/.test(password)
    }
  ];
};

/**
 * Parse reset token from URL
 */
export const parseResetToken = (): boolean => {
  const currentUrl = window.location.href;
  
  // Check hash for access_token
  if (window.location.hash && 
      window.location.hash.includes('access_token=') && 
      window.location.hash.includes('type=recovery')) {
    return true;
  }
  
  // Check query params for access_token
  if (window.location.search && window.location.search.includes('access_token=')) {
    return true;
  }
  
  return false;
};

/**
 * Redirect to reset password page with token
 */
export const redirectToResetPassword = (): void => {
  const currentUrl = window.location.href;
  
  if (window.location.pathname.includes('/signin')) {
    window.location.href = `/reset-password${window.location.search}${window.location.hash}`;
  }
};

/**
 * Clear URL hash and tokens
 */
export const clearUrlTokens = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

/**
 * Get URL for auth redirects
 */
export const getRedirectUrl = (path: string = 'auth/callback'): string => {
  return `${window.location.origin}/${path}`;
};

/**
 * Store email in localStorage for "remember me" feature
 */
export const storeRememberMe = (email: string, remember: boolean) => {
  if (remember) {
    localStorage.setItem('remember_email', email);
  } else {
    localStorage.removeItem('remember_email');
  }
};

/**
 * Get remembered email
 */
export const getRememberedEmail = (): string => {
  return localStorage.getItem('remember_email') || '';
};