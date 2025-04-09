import AuthContainer from './components/auth/AuthContainer';

interface SignInProps {
  onSuccess?: () => void;
}

export function SignIn({ onSuccess }: SignInProps) {
  return <AuthContainer onSuccess={onSuccess} />;
}