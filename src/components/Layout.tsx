import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';
import NavButtons from './NavButtons';
import { Alert } from './ui/alert';
import { AlertTitle, AlertDescription } from './ui/alert';
import { LogIn } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showAlert?: boolean;
  alertTitle?: string;
  alertDescription?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showAlert = false,
  alertTitle = '',
  alertDescription = ''
}) => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />
      <div className="fixed top-0 bottom-0 left-0 right-0 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      {/* Main Content */}
      <div className="flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="py-6 px-4 sm:px-6 lg:px-8 relative">
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
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:via-purple-200 group-hover:to-blue-100">
                    NeuraVerse
                  </h1>
                </a>
              </div>

              {/* User is signed in - show nav buttons */}
              {user ? (
                <NavButtons
                  navigate={navigate}
                  isAdmin={isAdmin}
                  user={user}
                  signOut={signOut}
                />
              ) : (
                <button 
                  onClick={() => navigate('/signin')}
                  className="group relative overflow-hidden backdrop-blur-xl shadow-lg border border-blue-500/30 bg-blue-600/40 text-white 
                    hover:bg-blue-500/60 hover:border-blue-400/50 hover:shadow-blue-500/30 
                    transform hover:scale-105 hover:-translate-y-0.5 
                    transition-all duration-300 
                    before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity
                    px-4 py-2 rounded-md flex items-center"
                >
                  <LogIn className="w-5 h-5 mr-1.5" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Optional Alert */}
        {showAlert && (
          <div className="container mx-auto max-w-7xl px-4 mb-6">
            <Alert>
              <AlertTitle>{alertTitle}</AlertTitle>
              <AlertDescription>{alertDescription}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;