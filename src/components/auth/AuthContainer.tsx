  // components/auth/AuthContainer.tsx
  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../../contexts/AuthContext';
  import GoogleAuthButton from './GoogleAuthButton';

  interface AuthContainerProps {
    onSuccess?: () => void;
  }

  const AuthContainer: React.FC<AuthContainerProps> = ({ onSuccess }) => {
    const { authenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [guestLoginLoading, setGuestLoginLoading] = useState(false);
    const [showLoginOptions, setShowLoginOptions] = useState(true);
    const [rememberMe, setRememberMe] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('dark');
    const [activeTab, setActiveTab] = useState<'signin' | 'guest'>('signin');

    // Theme handling
    useEffect(() => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'dark';
      setCurrentTheme(savedTheme);
      
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        // System preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }, []);

    // Redirect to dashboard if already authenticated
    useEffect(() => {
      if (authenticated && !isLoading) {
        navigate('/dashboard');
        if (onSuccess) onSuccess();
      }
    }, [authenticated, isLoading, navigate, onSuccess]);

    const handleAuthError = (message: string) => {
      setError(message);
      setSuccess(null);
    };

    const handleAuthSuccess = () => {
      if (rememberMe) {
        localStorage.setItem('rememberAuth', 'true');
      }
      
      setSuccess('Authentication successful! Redirecting...');
      setError(null);
      
      if (onSuccess) {
        onSuccess();
      }
    };

    // Handle guest access
    const handleGuestAccess = () => {
      setGuestLoginLoading(true);
      setSuccess('Accessing as guest...');
      
      // Direct navigation without waiting for any authentication
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    };

    // Toggle dark/light theme
    const toggleTheme = () => {
      if (currentTheme === 'light') {
        setCurrentTheme('dark');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        setCurrentTheme('light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    };

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-6 transition-colors duration-300">
        {/* Elegant background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/path/to/subtle-pattern.png')] opacity-10 dark:opacity-5 mix-blend-overlay"></div>
          <div className="absolute -top-40 right-0 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Theme toggle button - refined */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:shadow-indigo-200/40 dark:hover:shadow-indigo-900/20 transition-all duration-300"
          aria-label="Toggle dark mode"
        >
          {currentTheme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="max-w-md w-full mx-auto bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl dark:shadow-indigo-900/10 border border-indigo-100/30 dark:border-indigo-500/10 relative z-10 overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="mb-10 text-center relative">
            <div className="inline-block p-4 bg-gradient-to-br from-indigo-100/80 to-purple-100/80 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl shadow-sm mb-6">
              <img 
                src="/white_logo.png" 
                alt="NeuraVerse Logo" 
                className="h-14 w-auto mx-auto filter drop-shadow-md dark:brightness-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 text-transparent bg-clip-text">
              NeuraVerse
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 font-light">
              Enter a world of infinite possibilities
            </p>
          </div>
          
          {/* Error and success messages - refined */}
          {(error || success) && (
            <div className="mb-6">
              {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-lg p-4 text-sm">{error}</div>}
              {success && <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-lg p-4 text-sm">{success}</div>}
            </div>
          )}
          
          {/* Tabs - elegant style */}
          <div className="flex rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-1 mb-8 shadow-inner">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('guest')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'guest'
                  ? 'bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              Guest Access
            </button>
          </div>
          
          {activeTab === 'signin' ? (
            <div>
              {/* Google Authentication Button - sophisticated style */}
              <div className="mb-6">
                <GoogleAuthButton 
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                />
              </div>
              
              {/* Remember me checkbox - elegant */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-600 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help? <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">Contact support</a>
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-indigo-50/70 dark:bg-indigo-900/20 rounded-xl p-5 mb-6 border border-indigo-100/50 dark:border-indigo-800/20">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Guest Features:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Browse public content</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Preview premium features</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>No saved preferences</span>
                  </li>
                </ul>
              </div>
              
              <button
                onClick={handleGuestAccess}
                disabled={guestLoginLoading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-indigo-600/20 dark:hover:shadow-indigo-900/40"
              >
                <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 blur-md"></span>
                </span>
                <span className="relative flex items-center justify-center">
                  {guestLoginLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-3"></div>
                      <span className="font-medium">Accessing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="font-medium">Continue as Guest</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          )}
          
          <div className="mt-10 pt-6 border-t border-indigo-100/30 dark:border-indigo-800/30">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <a href="#" className="text-xs text-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-xs text-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Help Center
              </a>
              <a href="#" className="text-xs text-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Contact Us
              </a>
            </div>
            
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Elegant device compatibility badge */}
        <div className="absolute bottom-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Optimized for all devices
        </div>
      </div>
    );
  };

  export default AuthContainer;