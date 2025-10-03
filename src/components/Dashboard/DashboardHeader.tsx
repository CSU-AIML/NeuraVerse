import { motion } from 'motion/react';
import { TypingAnimation } from '../magicui/typing-animation';
import { Plus, Mail, Shield, LogOut, Users, BookOpen, Code, FileCode, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserRoleIndicator from '../UserRoleIndicator';
// Logo will be referenced directly from public folder
import { NavigateFunction } from 'react-router-dom';

interface DashboardHeaderProps {
  navigate: NavigateFunction;
  isAdmin: boolean;
  user: any;
  signOut: () => Promise<void>;
}

const DashboardHeader = ({ navigate, isAdmin, user, signOut }: DashboardHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  // Handle responsive behavior based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const navigateAndClose = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Common button styles
  const buttonBaseClass = "group relative overflow-hidden backdrop-blur-xl shadow-lg text-white transform transition-all duration-300 before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity";
  
  const getButtonClass = (baseColor: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: "text-xs px-2 py-1.5",
      md: "text-sm px-3 py-2",
      lg: "px-4 py-2"
    };
    
    return `${buttonBaseClass} border border-${baseColor}-500/30 bg-${baseColor}-600/40 hover:bg-${baseColor}-500/60 hover:border-${baseColor}-400/50 hover:shadow-${baseColor}-500/30 hover:scale-105 hover:-translate-y-0.5 ${sizeClasses[size]}`;
  };

  // Desktop Navigation (1024px+)
  const DesktopNavigation = () => (
    <div className="hidden lg:flex gap-3 items-center">
      {isAdmin && (
        <>
          <Button
            onClick={() => navigate("/new")}
            variant="secondary"
            className={getButtonClass("blue", "lg")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          
          <Button
            onClick={() => navigate("/users")}
            variant="secondary"
            className={getButtonClass("purple", "lg")}
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </>
      )}
      
      {/* Resources Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className={getButtonClass("cyan", "lg")}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Resources
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-white shadow-2xl"
          sideOffset={5}
        >
          <DropdownMenuItem 
            onClick={() => navigate('/api')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer focus:bg-blue-600/30"
          >
            <Code className="w-4 h-4 mr-2" />
            API Reference
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/templates')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer focus:bg-blue-600/30"
          >
            <FileCode className="w-4 h-4 mr-2" />
            Templates
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/tutorials')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer focus:bg-blue-600/30"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Tutorials
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        onClick={() => navigate("/contact")}
        variant="secondary"
        className={getButtonClass("pink", "lg")}
      >
        <Mail className="w-4 h-4 mr-2" />
        Contact
      </Button>
      
      {isAdmin && <UserRoleIndicator user={user} />}
      
      <Button
        onClick={handleSignOut}
        variant="secondary"
        className={getButtonClass("red", "lg")}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );

  // Tablet Navigation (768px-1023px)
  const TabletNavigation = () => (
    <div className="hidden md:flex lg:hidden gap-2 items-center">
      {isAdmin && (
        <Button
          onClick={() => navigate("/new")}
          variant="secondary"
          className={getButtonClass("blue", "md")}
          title="New Project"
        >
          <Plus className="w-4 h-4" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className={getButtonClass("cyan", "md")}
            title="Resources"
          >
            <BookOpen className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-white shadow-2xl"
          sideOffset={5}
        >
          <DropdownMenuItem 
            onClick={() => navigate('/api')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer focus:bg-blue-600/30"
          >
            <Code className="w-4 h-4 mr-2" />
            API Reference
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/templates')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer focus:bg-blue-600/30"
          >
            <FileCode className="w-4 h-4 mr-2" />
            Templates
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/tutorials')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer focus:bg-blue-600/30"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Tutorials
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        onClick={() => navigate("/contact")}
        variant="secondary"
        className={getButtonClass("pink", "md")}
        title="Contact"
      >
        <Mail className="w-4 h-4" />
      </Button>
      
      {isAdmin && (
        <Button
          onClick={() => navigate("/users")}
          variant="secondary"
          className={getButtonClass("purple", "md")}
          title="Manage Users"
        >
          <Users className="w-4 h-4" />
        </Button>
      )}
      
      <Button
        onClick={handleSignOut}
        variant="secondary"
        className={getButtonClass("red", "md")}
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <Button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      variant="ghost"
      className="md:hidden p-2 text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
      aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
    >
      {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </Button>
  );

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center justify-between mb-6 sm:mb-8 p-4 sm:p-6 border border-white/20 bg-slate-900/40 backdrop-blur-2xl shadow-2xl rounded-xl"
      >
        {/* Logo and title section */}
        <div className="flex items-center space-x-3 min-w-0 flex-1 md:flex-none">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-shrink-0"
          >
            <img 
              src="/CSU_Star-removebg-preview.png" 
              alt="AI/ML Projects Dashboard" 
              className="h-8 w-auto"
            />
          </motion.div>
          <TypingAnimation
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white truncate"
            duration={50}
            as="h1"
          >
            NeuraVerse
          </TypingAnimation>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <DesktopNavigation />
          <TabletNavigation />
          <MobileMenuButton />
        </div>
      </motion.div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-80 max-w-[80vw] bg-gradient-to-br from-slate-900/98 to-slate-950/98 backdrop-blur-xl border-l border-white/20 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <Button
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="ghost"
                  className="p-2 text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {isAdmin && (
                    <>
                      <Button
                        onClick={() => navigateAndClose("/new")}
                        variant="secondary"
                        className="w-full justify-start px-4 py-3 bg-blue-600/40 hover:bg-blue-500/60 border border-blue-500/30 text-white"
                      >
                        <Plus className="w-5 h-5 mr-3" />
                        New Project
                      </Button>
                      
                      <Button
                        onClick={() => navigateAndClose("/users")}
                        variant="secondary"
                        className="w-full justify-start px-4 py-3 bg-purple-600/40 hover:bg-purple-500/60 border border-purple-500/30 text-white"
                      >
                        <Users className="w-5 h-5 mr-3" />
                        Manage Users
                      </Button>
                    </>
                  )}
                  
                  {/* Resources Section */}
                  <div className="space-y-2 rounded-lg bg-slate-800/50 p-4 border border-slate-700/50">
                    <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Resources
                    </h3>
                    <Button
                      onClick={() => navigateAndClose("/api")}
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 hover:bg-cyan-600/30 text-white text-sm"
                    >
                      <Code className="w-4 h-4 mr-3" />
                      API Reference
                    </Button>
                    <Button
                      onClick={() => navigateAndClose("/templates")}
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 hover:bg-cyan-600/30 text-white text-sm"
                    >
                      <FileCode className="w-4 h-4 mr-3" />
                      Templates
                    </Button>
                    <Button
                      onClick={() => navigateAndClose("/tutorials")}
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 hover:bg-cyan-600/30 text-white text-sm"
                    >
                      <BookOpen className="w-4 h-4 mr-3" />
                      Tutorials
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => navigateAndClose("/contact")}
                    variant="secondary"
                    className="w-full justify-start px-4 py-3 bg-pink-600/40 hover:bg-pink-500/60 border border-pink-500/30 text-white"
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    Contact
                  </Button>
                  
                  {/* User role indicator */}
                  {isAdmin && (
                    <div className="px-4 py-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg flex items-center">
                      <Shield className="w-5 h-5 mr-3 text-emerald-400" />
                      <span className="text-emerald-300 text-sm">Admin</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sign Out Button at bottom */}
              <div className="p-6 border-t border-white/10">
                <Button
                  onClick={handleSignOut}
                  variant="secondary"
                  className="w-full justify-start px-4 py-3 bg-red-600/30 hover:bg-red-500/50 border border-red-500/30 text-white"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default DashboardHeader;