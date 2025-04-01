import { Plus, Mail, Shield, LogOut, Users, BookOpen, Code, FileCode } from 'lucide-react';
import { Button } from './ui/button';
import { NavigateFunction } from 'react-router-dom';
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
  const handleSignOut = async () => {
    await signOut();
    // The auth context will handle the state updates
  };

  return (
    <div className="flex gap-4 relative z-10">
      {/* Admin actions */}
      {isAdmin && (
        <>
          <Button
            onClick={() => navigate("/new")}
            variant="secondary"
            className="group relative overflow-hidden backdrop-blur-xl shadow-lg border border-blue-500/30 bg-blue-600/40 text-white 
              hover:bg-blue-500/60 hover:border-blue-400/50 hover:shadow-blue-500/30 
              transform hover:scale-105 hover:-translate-y-0.5 
              transition-all duration-300 
              before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            New Project
          </Button>
          
          <Button
            onClick={() => navigate("/users")}
            variant="secondary"
            className="group relative overflow-hidden backdrop-blur-xl shadow-lg border border-purple-500/30 bg-purple-600/40 text-white 
              hover:bg-purple-500/60 hover:border-purple-400/50 hover:shadow-purple-500/30 
              transform hover:scale-105 hover:-translate-y-0.5 
              transition-all duration-300 
              before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity"
          >
            <Users className="w-5 h-5 mr-1.5" />
            <span className="hidden md:inline ml-1">Manage Users</span>
          </Button>
        </>
      )}
      
      {/* Resources Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="group relative overflow-hidden backdrop-blur-xl shadow-lg border border-cyan-500/30 bg-cyan-600/40 text-white 
              hover:bg-cyan-500/60 hover:border-cyan-400/50 hover:shadow-cyan-500/30 
              transform hover:scale-105 hover:-translate-y-0.5 
              transition-all duration-300 
              before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity"
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
        className="group relative overflow-hidden backdrop-blur-xl shadow-lg border border-pink-500/30 bg-pink-600/40 text-white 
          hover:bg-pink-500/60 hover:border-pink-400/50 hover:shadow-pink-500/30 
          transform hover:scale-105 hover:-translate-y-0.5 
          transition-all duration-300 
          before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity"
      >
        <Mail className={`w-5 h-5 mr-1.5 text-pink-1000`} />
        Contact
      </Button>
      
      {/* User role indicator */}
      {isAdmin && (
        <UserRoleIndicator user={user} />
      )}
      
      <Button
        onClick={handleSignOut}
        variant="secondary"
        className="group relative overflow-hidden backdrop-blur-xl shadow-lg border border-red-500/30 bg-red-600/20 text-white 
          hover:bg-red-500/40 hover:border-red-400/50 hover:shadow-red-500/30 
          transform hover:scale-105 hover:-translate-y-0.5 
          transition-all duration-300 
          before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity"
      >
        <LogOut className="w-5 h-5 mr-1.5" />
        Sign Out
      </Button>
    </div>
  );
};

export default NavButtons;