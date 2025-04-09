// pages/UserManagement/UserManagementHeader.tsx
import React from 'react';
import { ArrowLeft, LogOut, RefreshCw, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: string;
  display_name?: string;
  avatar_url?: string;
}

interface UserManagementHeaderProps {
  user: User | null;
  isAdmin: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  user,
  isAdmin,
  onRefresh,
  onSignOut
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            User Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.display_name || 'User'} 
                  className="h-8 w-8 rounded-full object-cover border border-purple-500/30"
                />
              ) : (
                <div className="h-8 w-8 bg-purple-800/30 rounded-full flex items-center justify-center border border-purple-500/30">
                  <User className="h-4 w-4 text-purple-300" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{user.display_name || user.email?.split('@')[0]}</span>
                <span className="text-xs text-gray-400">{isAdmin ? 'Admin' : 'User'}</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={onRefresh}
            className="flex items-center gap-2 backdrop-blur-xl shadow-lg border border-purple-500/30 bg-purple-600/40 text-white hover:bg-purple-500/60 hover:border-purple-400/50 hover:shadow-purple-500/30 hover:scale-105 hover:translate-y-[-2px] transition-all duration-300 group"
          >
            <RefreshCw className="w-4 h-4 group-hover:animate-spin" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementHeader;