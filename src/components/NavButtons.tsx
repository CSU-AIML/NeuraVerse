import { Plus, Mail, Shield, LogOut, Users, BookOpen, Code, FileCode, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { NavigateFunction } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserRoleIndicator from './UserRoleIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NavButtonsProps {
  navigate: NavigateFunction;
  isAdmin: boolean;
  user: any;
  signOut: () => Promise<void>;
}

const NavButtons = ({ navigate, isAdmin, user, signOut }: NavButtonsProps) => {
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
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    // The auth context will handle the state updates
  };

  const navigateAndClose = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Common button styles with responsive adjustments
  const buttonBaseClass = "group relative overflow-hidden backdrop-blur-xl shadow-lg text-white transform transition-all duration-300 before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity";
  
  const getButtonClass = (baseColor: string) => {
    return `${buttonBaseClass} border border-${baseColor}-500/30 bg-${baseColor}-600/40 hover:bg-${baseColor}-500/60 hover:border-${baseColor}-400/50 hover:shadow-${baseColor}-500/30 hover:scale-105 hover:-translate-y-0.5 ${
      screenSize.isMobile ? "text-sm px-3 py-1.5" : 
      screenSize.isTablet ? "text-sm px-3 py-2" : 
      "px-4 py-2"
    }`;
  };

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <Button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      variant="ghost"
      className={`${buttonBaseClass} border border-slate-500/30 bg-slate-600/40 lg:hidden fixed top-4 right-4 z-50 rounded-full p-2`}
      aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
    >
      {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </Button>
  );

  // Desktop Navigation
  const DesktopNavigation = () => (
    <div className="hidden lg:flex gap-2 xl:gap-4 relative z-10 items-center">
      {/* Admin actions */}
      {isAdmin && (
        <>
          <Button
            onClick={() => navigate("/new")}
            variant="secondary"
            className={getButtonClass("blue")}
          >
            <Plus className="w-5 h-5 mr-1.5" />
            New Project
          </Button>
          
          <Button
            onClick={() => navigate("/users")}
            variant="secondary"
            className={getButtonClass("purple")}
          >
            <Users className="w-5 h-5 mr-1.5" />
            <span className="inline ml-1">Manage Users</span>
          </Button>
        </>
      )}
      
      {/* Resources Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className={getButtonClass("cyan")}
          >
            <BookOpen className="w-5 h-5 mr-1.5" />
            Resources
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-900 border border-slate-700 text-white">
          <DropdownMenuItem 
            onClick={() => navigate('/api')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer"
          >
            <Code className="w-4 h-4 mr-2" />
            API Reference
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/templates')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer"
          >
            <FileCode className="w-4 h-4 mr-2" />
            Templates
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/tutorials')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Tutorials
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        onClick={() => navigate("/contact")}
        variant="secondary"
        className={getButtonClass("pink")}
      >
        <Mail className="w-5 h-5 mr-1.5" />
        Contact
      </Button>
      
      {/* User role indicator */}
      {isAdmin && (
        <UserRoleIndicator user={user} />
      )}
      
      <Button
        onClick={handleSignOut}
        variant="secondary"
        className={getButtonClass("red")}
      >
        <LogOut className="w-5 h-5 mr-1.5" />
        Sign Out
      </Button>
    </div>
  );

  // Tablet Navigation (Mid-size screens)
  const TabletNavigation = () => (
    <div className="hidden sm:flex lg:hidden flex-wrap gap-2 relative z-10 items-center">
      {/* Show fewer buttons with icons only for some */}
      {isAdmin && (
        <Button
          onClick={() => navigate("/new")}
          variant="secondary"
          className={getButtonClass("blue")}
          title="New Project"
        >
          <Plus className="w-5 h-5" />
          <span className="sr-only">New Project</span>
        </Button>
      )}
      
      {/* Resources Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className={getButtonClass("cyan")}
            title="Resources"
          >
            <BookOpen className="w-5 h-5" />
            <span className="sr-only">Resources</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-900 border border-slate-700 text-white">
          <DropdownMenuItem 
            onClick={() => navigate('/api')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer"
          >
            <Code className="w-4 h-4 mr-2" />
            API Reference
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/templates')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer"
          >
            <FileCode className="w-4 h-4 mr-2" />
            Templates
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/tutorials')}
            className="flex items-center hover:bg-blue-600/30 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Tutorials
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        onClick={() => navigate("/contact")}
        variant="secondary"
        className={getButtonClass("pink")}
        title="Contact"
      >
        <Mail className="w-5 h-5" />
        <span className="sr-only">Contact</span>
      </Button>
      
      {isAdmin && (
        <Button
          onClick={() => navigate("/users")}
          variant="secondary"
          className={getButtonClass("purple")}
          title="Manage Users"
        >
          <Users className="w-5 h-5" />
          <span className="sr-only">Manage Users</span>
        </Button>
      )}
      
      <Button
        onClick={handleSignOut}
        variant="secondary"
        className={getButtonClass("red")}
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
        <span className="sr-only">Sign Out</span>
      </Button>
    </div>
  );

  // Mobile Navigation (Slide-in menu)
  const MobileNavigation = () => (
    <div className={`fixed inset-0 z-40 flex flex-col bg-gradient-to-br from-slate-900/95 to-slate-950/98 backdrop-blur-lg transform transition-transform duration-300 ease-in-out ${
      isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col items-center justify-center h-full w-full p-8 space-y-6 overflow-y-auto">
        <div className="space-y-4 w-full max-w-xs">
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
          
          <div className="space-y-2 rounded-lg bg-slate-800/50 p-3 border border-slate-700/50">
            <h3 className="text-white text-sm font-medium mb-2 pl-2">Resources</h3>
            <Button
              onClick={() => navigateAndClose("/api")}
              variant="ghost"
              className="w-full justify-start px-4 py-2 hover:bg-cyan-600/30 text-white text-sm"
            >
              <Code className="w-4 h-4 mr-3" />
              API Reference
            </Button>
            
            <Button
              onClick={() => navigateAndClose("/templates")}
              variant="ghost"
              className="w-full justify-start px-4 py-2 hover:bg-cyan-600/30 text-white text-sm"
            >
              <FileCode className="w-4 h-4 mr-3" />
              Templates
            </Button>
            
            <Button
              onClick={() => navigateAndClose("/tutorials")}
              variant="ghost"
              className="w-full justify-start px-4 py-2 hover:bg-cyan-600/30 text-white text-sm"
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
          
          {/* User role indicator (simplified for mobile) */}
          {isAdmin && (
            <div className="px-4 py-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg flex items-center">
              <Shield className="w-5 h-5 mr-3 text-emerald-400" />
              <span className="text-emerald-300 text-sm">Admin</span>
            </div>
          )}
          
          <Button
            onClick={handleSignOut}
            variant="secondary"
            className="w-full justify-start px-4 py-3 bg-red-600/30 hover:bg-red-500/50 border border-red-500/30 text-white mt-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileMenuButton />
      <DesktopNavigation />
      <TabletNavigation />
      <MobileNavigation />
    </>
  );
};

export default NavButtons;