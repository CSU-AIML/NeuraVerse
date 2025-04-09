import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';
import NavButtons from './NavButtons';
import { Alert } from './ui/alert';
import { AlertTitle, AlertDescription } from './ui/alert';
import { LogIn, Menu, X, ChevronUp, Bell, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  showAlert?: boolean;
  alertTitle?: string;
  alertDescription?: string;
  alertType?: 'default' | 'info' | 'warning' | 'success' | 'error';
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showAlert = false,
  alertTitle = '',
  alertDescription = '',
  alertType = 'default'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [alertVisible, setAlertVisible] = useState(showAlert);

  // Handle theme toggle
  useEffect(() => {
    // Check local storage or system preference for initial theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
        setShowScrollTop(window.scrollY > 300);
      } else {
        setScrolled(false);
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Close alert function
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Get alert styles based on type
  const getAlertStyles = () => {
    const baseStyles = "border rounded-lg shadow-lg";
    
    switch(alertType) {
      case 'info':
        return `${baseStyles} bg-blue-900/20 border-blue-500/30 text-blue-100`;
      case 'warning':
        return `${baseStyles} bg-amber-900/20 border-amber-500/30 text-amber-100`;
      case 'success':
        return `${baseStyles} bg-emerald-900/20 border-emerald-500/30 text-emerald-100`;
      case 'error':
        return `${baseStyles} bg-red-900/20 border-red-500/30 text-red-100`;
      default:
        return `${baseStyles} bg-slate-800/50 border-slate-700/50 text-slate-100`;
    }
  };

  // Animation variants
  const mobileMenuVariants = {
    closed: { opacity: 0, x: '100%', transition: { duration: 0.3 } },
    open: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-300`}>
      {/* Decorative Background Elements - Enhanced for light/dark themes */}
      <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-grid-white/[0.02]' : 'bg-grid-black/[0.03]'} bg-[size:20px_20px] pointer-events-none`} />
      <div className={`fixed top-0 bottom-0 left-0 right-0 ${
        theme === 'dark' 
          ? 'bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]' 
          : 'bg-slate-50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]'
      }`} />
      
      {/* Main Content */}
      <div className="flex flex-col min-h-screen relative z-10">
        {/* Header - Enhanced with scroll effects */}
        <header 
          className={`py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 transition-all duration-300 ${
            scrolled 
              ? `${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-lg shadow-md` 
              : 'bg-transparent'
          }`}
        >
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <a
                  href="/"
                  className="flex items-center space-x-3 group"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-inner shadow-white/10">
                    <img
                      src="/white_logo.png"
                      alt="NeuraVerse Logo"
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h1 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                    ${theme === 'dark' 
                      ? 'from-white via-blue-200 to-purple-200 group-hover:from-blue-300 group-hover:via-purple-200 group-hover:to-blue-100' 
                      : 'from-blue-600 via-purple-600 to-blue-600 group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-blue-700'
                    } 
                    transition-all duration-500`}
                  >
                    NeuraVerse
                  </h1>
                </a>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-4">
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* User is signed in - show nav buttons */}
                {user ? (
                  <NavButtons
                    navigate={navigate}
                    isAdmin={isAdmin}
                    user={user}
                    signOut={signOut}
                  />
                ) : (
                  <motion.button 
                    onClick={() => navigate('/signin')}
                    className={`relative overflow-hidden backdrop-blur-xl shadow-lg border 
                      ${theme === 'dark'
                        ? 'border-blue-500/30 bg-blue-600/40 text-white hover:bg-blue-500/60 hover:border-blue-400/50 hover:shadow-blue-500/30'
                        : 'border-blue-300/50 bg-blue-500/80 text-white hover:bg-blue-600 hover:border-blue-500/70 hover:shadow-blue-500/20'
                      }
                      transform hover:scale-105 hover:-translate-y-0.5 
                      transition-all duration-300 
                      before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity
                      px-4 py-2 rounded-md flex items-center`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn className="w-5 h-5 mr-1.5" />
                    Sign In
                  </motion.button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center">
                <button
                  onClick={toggleTheme}
                  className={`p-2 mr-2 rounded-full transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={toggleMobileMenu}
                  className={`p-2 rounded-md ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className={`fixed inset-0 top-[73px] z-40 ${theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-lg lg:hidden`}
            >
              <div className="flex flex-col h-full px-4 py-6 overflow-y-auto">
                {user ? (
                  <div className="flex flex-col space-y-4">
                    {/* User Profile Section */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} border ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {user.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {user.display_name || 'User'}
                          </p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="mt-3 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/20 text-blue-400 text-xs font-medium inline-flex items-center">
                          <Bell className="w-3 h-3 mr-1" />
                          Admin
                        </div>
                      )}
                    </div>

                    {/* Navigation Links - Mobile specific */}
                    <NavButtonsMobile 
                      navigate={navigate}
                      isAdmin={isAdmin}
                      signOut={signOut}
                      theme={theme}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <button
                      onClick={() => navigate('/signin')}
                      className={`w-full py-3 px-4 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-blue-600 text-white hover:bg-blue-500'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } transition-colors duration-300 flex items-center justify-center`}
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </button>
                    <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sign in to access all features
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional Alert - Enhanced with animations and dismiss */}
        <AnimatePresence>
          {showAlert && alertVisible && (
            <motion.div 
              className="container mx-auto max-w-7xl px-4 mt-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`${getAlertStyles()} relative overflow-hidden`}>
                <Alert className="bg-transparent border-0 shadow-none">
                  <AlertTitle className="flex items-center text-lg font-semibold">
                    {getAlertIcon(alertType)}
                    {alertTitle}
                  </AlertTitle>
                  <AlertDescription className="ml-6 mt-1">
                    {alertDescription}
                  </AlertDescription>
                </Alert>
                <button 
                  onClick={dismissAlert}
                  className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors duration-300"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Animated progress bar for auto-dismiss */}
                <motion.div 
                  className={`absolute bottom-0 left-0 h-0.5 ${
                    alertType === 'info' ? 'bg-blue-400' :
                    alertType === 'warning' ? 'bg-amber-400' :
                    alertType === 'success' ? 'bg-emerald-400' :
                    alertType === 'error' ? 'bg-red-400' : 'bg-gray-400'
                  }`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 10 }}
                  onAnimationComplete={dismissAlert}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-grow container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Footer */}
        <Footer/>
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-50 ${
              theme === 'dark'
                ? 'bg-blue-600/80 hover:bg-blue-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors duration-300`}
            aria-label="Scroll to top"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mobile navigation component
const NavButtonsMobile = ({ 
  navigate, 
  isAdmin, 
  signOut,
  theme
}: { 
  navigate: (path: string) => void, 
  isAdmin: boolean, 
  signOut: () => Promise<void>,
  theme: 'dark' | 'light'
}) => {
  
  // Common button styles for mobile
  const buttonClass = `w-full py-3 px-4 rounded-lg flex items-center ${
    theme === 'dark'
      ? 'border border-slate-700/50 bg-slate-800/30 text-white hover:bg-slate-700/50'
      : 'border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200'
  } transition-colors duration-300`;
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="space-y-3">
      <button onClick={() => navigate('/dashboard')} className={buttonClass}>
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </button>
      
      {isAdmin && (
        <>
          <button onClick={() => navigate('/new')} className={buttonClass}>
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Project
          </button>
          
          <button onClick={() => navigate('/users')} className={buttonClass}>
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage Users
          </button>
        </>
      )}
      
      <button onClick={() => navigate('/api')} className={buttonClass}>
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        API Reference
      </button>
      
      <button onClick={() => navigate('/templates')} className={buttonClass}>
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        Templates
      </button>
      
      <button onClick={() => navigate('/tutorials')} className={buttonClass}>
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Tutorials
      </button>
      
      <button onClick={() => navigate('/contact')} className={buttonClass}>
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Contact
      </button>
      
      <button onClick={handleSignOut} className={`w-full py-3 px-4 rounded-lg flex items-center ${
        theme === 'dark'
          ? 'border border-red-700/30 bg-red-900/20 text-red-300 hover:bg-red-800/30'
          : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
      } transition-colors duration-300 mt-6`}>
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>
    </div>
  );
};

// Helper function to get the alert icon based on type
const getAlertIcon = (type: 'default' | 'info' | 'warning' | 'success' | 'error') => {
  switch(type) {
    case 'info':
      return (
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'success':
      return (
        <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export default Layout;