import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';
import NavButtons from './Dashboard/DashboardHeader';
import { Alert } from './ui/alert';
import { AlertTitle, AlertDescription } from './ui/alert';
import { LogIn, Menu, X, ChevronUp, Bell, Sun, Moon, Sparkles } from 'lucide-react';
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

  // Theme management with improved system detection
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // Check stored theme preference first
        const savedTheme = window.localStorage?.getItem('theme') as 'dark' | 'light' | null;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          if (!savedTheme) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
          }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } catch (error) {
        // Fallback if localStorage is not available
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    };

    initializeTheme();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    try {
      window.localStorage?.setItem('theme', newTheme);
    } catch (error) {
      console.log('localStorage not available for theme storage');
    }
  };

  // Enhanced scroll behavior with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setScrolled(scrollY > 20);
          setShowScrollTop(scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle alert visibility
  useEffect(() => {
    setAlertVisible(showAlert);
  }, [showAlert]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dismissAlert = () => {
    setAlertVisible(false);
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-300 relative`}>
      {/* Enhanced Background Effects */}
      <BackgroundEffects theme={theme} />
      
      {/* Main Content Container */}
      <div className="flex flex-col min-h-screen relative z-10">
        {/* Enhanced Header */}
        <Header
          theme={theme}
          scrolled={scrolled}
          user={user}
          isAdmin={isAdmin}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleTheme={toggleTheme}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          navigate={navigate}
          signOut={signOut}
        />

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          theme={theme}
          user={user}
          isAdmin={isAdmin}
          navigate={navigate}
          signOut={signOut}
        />

        {/* Alert System */}
        <AlertSystem
          visible={alertVisible}
          title={alertTitle}
          description={alertDescription}
          type={alertType}
          onDismiss={dismissAlert}
        />

        {/* Main Content */}
        <main className="flex-grow container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton visible={showScrollTop} onClick={scrollToTop} theme={theme} />
    </div>
  );
};

// Background Effects Component
const BackgroundEffects: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => (
  <>
    {/* Grid Pattern */}
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-grid-white/[0.02]' : 'bg-grid-black/[0.03]'} bg-[size:20px_20px] pointer-events-none`} />
    
    {/* Gradient Overlay */}
    <div className={`fixed inset-0 ${
      theme === 'dark' 
        ? 'bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]' 
        : 'bg-slate-50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]'
    }`} />
    
    {/* Floating Particles */}
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 ${theme === 'dark' ? 'bg-blue-400/20' : 'bg-blue-500/30'} rounded-full`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  </>
);

// Header Component
interface HeaderProps {
  theme: 'dark' | 'light';
  scrolled: boolean;
  user: any;
  isAdmin: boolean;
  isMobileMenuOpen: boolean;
  toggleTheme: () => void;
  toggleMobileMenu: () => void;
  navigate: NavigateFunction;
  signOut: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  scrolled,
  user,
  isAdmin,
  isMobileMenuOpen,
  toggleTheme,
  toggleMobileMenu,
  navigate,
  signOut
}) => (
  <motion.header 
    className={`py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? `${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-lg shadow-md border-b ${theme === 'dark' ? 'border-slate-800/50' : 'border-slate-200/50'}` 
        : 'bg-transparent'
    }`}
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="container mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Logo theme={theme} />

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4">
          <ThemeToggle theme={theme} onClick={toggleTheme} />
          
          {user ? (
            <NavButtons
              navigate={navigate}
              isAdmin={isAdmin}
              user={user}
              signOut={signOut}
            />
          ) : (
            <SignInButton theme={theme} onClick={() => navigate('/signin')} />
          )}
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden flex items-center space-x-2">
          <ThemeToggle theme={theme} onClick={toggleTheme} />
          <MobileMenuButton 
            isOpen={isMobileMenuOpen}
            onClick={toggleMobileMenu}
            theme={theme}
          />
        </div>
      </div>
    </div>
  </motion.header>
);

// Logo Component
const Logo: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => (
  <motion.a
    href="/"
    className="flex items-center space-x-3 group"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg">
      <img 
        src="/CSUstar.png" 
        alt="NeuraVerse Logo" 
        className="h-full w-full object-contain"
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
  </motion.a>
);

// Theme Toggle Component
const ThemeToggle: React.FC<{ theme: 'dark' | 'light'; onClick: () => void }> = ({ theme, onClick }) => (
  <motion.button 
    onClick={onClick}
    className={`p-2 rounded-full transition-all duration-300 ${
      theme === 'dark'
        ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
    }`}
    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <AnimatePresence mode="wait">
      {theme === 'dark' ? (
        <motion.div
          key="sun"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Sun className="w-5 h-5" />
        </motion.div>
      ) : (
        <motion.div
          key="moon"
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Moon className="w-5 h-5" />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

// Sign In Button Component
const SignInButton: React.FC<{ theme: 'dark' | 'light'; onClick: () => void }> = ({ theme, onClick }) => (
  <motion.button 
    onClick={onClick}
    className={`relative overflow-hidden backdrop-blur-xl shadow-lg border 
      ${theme === 'dark'
        ? 'border-blue-500/30 bg-blue-600/40 text-white hover:bg-blue-500/60 hover:border-blue-400/50 hover:shadow-blue-500/30'
        : 'border-blue-300/50 bg-blue-500/80 text-white hover:bg-blue-600 hover:border-blue-500/70 hover:shadow-blue-500/20'
      }
      px-4 py-2 rounded-lg flex items-center transition-all duration-300
      before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity`}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <LogIn className="w-5 h-5 mr-1.5" />
    Sign In
  </motion.button>
);

// Mobile Menu Button Component
const MobileMenuButton: React.FC<{ 
  isOpen: boolean; 
  onClick: () => void; 
  theme: 'dark' | 'light' 
}> = ({ isOpen, onClick, theme }) => (
  <motion.button
    onClick={onClick}
    className={`p-2 rounded-lg ${
      theme === 'dark'
        ? 'text-gray-300 hover:bg-gray-800/50'
        : 'text-gray-700 hover:bg-gray-200/50'
    } transition-all duration-300`}
    aria-label="Toggle menu"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          key="close"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <X className="w-6 h-6" />
        </motion.div>
      ) : (
        <motion.div
          key="menu"
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Menu className="w-6 h-6" />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

// Mobile Menu Component
interface MobileMenuProps {
  isOpen: boolean;
  theme: 'dark' | 'light';
  user: any;
  isAdmin: boolean;
  navigate: (path: string) => void;
  signOut: () => Promise<void>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  theme,
  user,
  isAdmin,
  navigate,
  signOut
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed inset-0 top-[73px] z-40 ${theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-lg lg:hidden`}
      >
        <div className="flex flex-col h-full px-6 py-8 overflow-y-auto">
          {user ? (
            <UserMobileMenu
              user={user}
              isAdmin={isAdmin}
              theme={theme}
              navigate={navigate}
              signOut={signOut}
            />
          ) : (
            <GuestMobileMenu theme={theme} navigate={navigate} />
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// User Mobile Menu Component
const UserMobileMenu: React.FC<{
  user: any;
  isAdmin: boolean;
  theme: 'dark' | 'light';
  navigate: (path: string) => void;
  signOut: () => Promise<void>;
}> = ({ user, isAdmin, theme, navigate, signOut }) => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    ...(isAdmin ? [
      { path: '/new', label: 'New Project', icon: 'plus' },
      { path: '/users', label: 'Manage Users', icon: 'users' }
    ] : []),
    { path: '/api', label: 'API Reference', icon: 'code' },
    { path: '/templates', label: 'Templates', icon: 'template' },
    { path: '/tutorials', label: 'Tutorials', icon: 'book' },
    { path: '/contact', label: 'Contact', icon: 'mail' }
  ];

  return (
    <div className="flex flex-col space-y-6">
      {/* User Profile Section */}
      <motion.div 
        className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} border ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
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
      </motion.div>

      {/* Navigation Links */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full py-3 px-4 rounded-lg flex items-center ${
              theme === 'dark'
                ? 'border border-slate-700/50 bg-slate-800/30 text-white hover:bg-slate-700/50'
                : 'border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200'
            } transition-all duration-300 group`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-5 h-5 mr-3">
              {/* Add icon mapping here */}
            </div>
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* Sign Out Button */}
      <motion.button
        onClick={signOut}
        className={`w-full py-3 px-4 rounded-lg flex items-center ${
          theme === 'dark'
            ? 'border border-red-700/30 bg-red-900/20 text-red-300 hover:bg-red-800/30'
            : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
        } transition-all duration-300 mt-auto`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-5 h-5 mr-3">
          {/* Sign out icon */}
        </div>
        Sign Out
      </motion.button>
    </div>
  );
};

// Guest Mobile Menu Component
const GuestMobileMenu: React.FC<{
  theme: 'dark' | 'light';
  navigate: (path: string) => void;
}> = ({ theme, navigate }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-6">
    <motion.button
      onClick={() => navigate('/signin')}
      className={`w-full py-3 px-4 rounded-lg ${
        theme === 'dark'
          ? 'bg-blue-600 text-white hover:bg-blue-500'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } transition-colors duration-300 flex items-center justify-center`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <LogIn className="w-5 h-5 mr-2" />
      Sign In
    </motion.button>
    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>
      Sign in to access all features
    </p>
  </div>
);

// Alert System Component
interface AlertSystemProps {
  visible: boolean;
  title: string;
  description: string;
  type: 'default' | 'info' | 'warning' | 'success' | 'error';
  onDismiss: () => void;
}

const AlertSystem: React.FC<AlertSystemProps> = ({
  visible,
  title,
  description,
  type,
  onDismiss
}) => {
  const getAlertStyles = () => {
    const baseStyles = "border rounded-lg shadow-lg";
    
    switch(type) {
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

  const getAlertIcon = () => {
    const iconClass = "w-5 h-5 mr-2";
    switch(type) {
      case 'info':
        return <Bell className={`${iconClass} text-blue-400`} />;
      case 'warning':
        return <span className={`${iconClass} text-amber-400`}>⚠️</span>;
      case 'success':
        return <span className={`${iconClass} text-emerald-400`}>✓</span>;
      case 'error':
        return <span className={`${iconClass} text-red-400`}>✗</span>;
      default:
        return <Bell className={`${iconClass} text-gray-400`} />;
    }
  };

  return (
    <AnimatePresence>
      {visible && (
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
                {getAlertIcon()}
                {title}
              </AlertTitle>
              <AlertDescription className="ml-6 mt-1">
                {description}
              </AlertDescription>
            </Alert>
            <button 
              onClick={onDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors duration-300"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
            <motion.div 
              className={`absolute bottom-0 left-0 h-0.5 ${
                type === 'info' ? 'bg-blue-400' :
                type === 'warning' ? 'bg-amber-400' :
                type === 'success' ? 'bg-emerald-400' :
                type === 'error' ? 'bg-red-400' : 'bg-gray-400'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 10 }}
              onAnimationComplete={onDismiss}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Scroll to Top Button Component
const ScrollToTopButton: React.FC<{
  visible: boolean;
  onClick: () => void;
  theme: 'dark' | 'light';
}> = ({ visible, onClick, theme }) => (
  <AnimatePresence>
    {visible && (
      <motion.button
        onClick={onClick}
        className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-50 ${
          theme === 'dark'
            ? 'bg-blue-600/80 hover:bg-blue-500 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } transition-all duration-300 backdrop-blur-lg border border-white/10`}
        aria-label="Scroll to top"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronUp className="w-5 h-5" />
      </motion.button>
    )}
  </AnimatePresence>
);

export default Layout;