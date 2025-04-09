// pages/UserManagement/index.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserManagementHeader from './UserManagement/UserManagementHeader';
import UserSearchFilter from './UserManagement/UserSearchFilter';
import UserList from './UserManagement/UserList';
import UserRoleInfo from './UserManagement/UserRoleInfo';
import AlertMessage from './UserManagement/AlertMessage';
import ConfirmationModal from './UserManagement/ConfirmationModal';
import { fetchUsers, promoteToAdmin, demoteToUser, removeUser, UserProfile } from './UserManagement/userManagementService';

export function UserManagement() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [demotingUserId, setDemotingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | null, message: string | null } | null>(null);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Only admins can access this page
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      setAlertMessage({
        type: 'error',
        message: 'You do not have permission to access the user management page.'
      });
    }
  }, [isAdmin, navigate]);

  // Fetch all users when component mounts
  useEffect(() => {
    if (isAdmin) {
      handleFetchUsers();
    }
  }, [isAdmin]);

  // Function to fetch user profiles
  const handleFetchUsers = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const { users: fetchedUsers, error } = await fetchUsers();
      
      if (error) {
        throw error;
      }
      
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAlertMessage({
        type: 'error',
        message: 'Failed to load users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRemoveModal = (userId: string) => {
    setUserToRemove(userId);
  };

  const confirmRemoveUser = async () => {
    if (!userToRemove) return;
    
    await handleRemoveUser(userToRemove);
    setUserToRemove(null);
  };
  
  // Function to promote a user to admin
  const handlePromoteToAdmin = async (userId: string) => {
    if (!isAdmin) return;
    
    setPromotingUserId(userId);
    try {
      const { success, error } = await promoteToAdmin(userId);
      
      if (!success) {
        throw error;
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'admin' } 
          : user
      ));
      
      setAlertMessage({
        type: 'success',
        message: 'User successfully promoted to admin'
      });
      
    } catch (error) {
      console.error('Error in promote to admin:', error);
      setAlertMessage({
        type: 'error',
        message: `Failed to promote user: ${error}`
      });
    } finally {
      setPromotingUserId(null);
    }
  };

  // Function to demote admin to standard user
  const handleDemoteToUser = async (userId: string) => {
    if (!isAdmin) return;
    
    setDemotingUserId(userId);
    try {
      const { success, error } = await demoteToUser(userId);
      
      if (!success) {
        throw error;
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'user' } 
          : user
      ));
      
      setAlertMessage({
        type: 'success',
        message: 'User successfully demoted to standard user'
      });
      
    } catch (error) {
      console.error('Error in demote to standard user:', error);
      setAlertMessage({
        type: 'error',
        message: `Failed to demote user: ${error}`
      });
    } finally {
      setDemotingUserId(null);
    }
  };

  // Function to remove a user completely from the system
  const handleRemoveUser = async (userId: string) => {
    if (!isAdmin) return;
    
    setRemovingUserId(userId);
    try {
      const { success, error } = await removeUser(userId);
      
      if (!success) {
        throw error;
      }
      
      // Update the local state
      setUsers(users.filter(user => user.id !== userId));
      
      setAlertMessage({
        type: 'success',
        message: 'User successfully removed from the system'
      });
      
    } catch (error) {
      console.error('Error in remove user:', error);
      setAlertMessage({
        type: 'error',
        message: `Failed to remove user: ${error}`
      });
    } finally {
      setRemovingUserId(null);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  // If not admin, don't render anything
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with user info and actions */}
        <UserManagementHeader 
          user={user}
          isAdmin={isAdmin}
          onRefresh={handleFetchUsers}
          onSignOut={handleSignOut}
        />
        
        {/* Alert Messages */}
        {alertMessage && (
          <AlertMessage 
            type={alertMessage.type} 
            message={alertMessage.message} 
          />
        )}
        
        {/* Search and Filters */}
        <UserSearchFilter 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        {/* User Table */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-gray-800/50 overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-blue-900/20 relative">
          {/* Subtle backdrop glow effect */}
          <div className="absolute inset-0 bg-blue-900/5 opacity-50 pointer-events-none"></div>
          
          {/* Table header with glass effect */}
          <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              User Management
              <span className="ml-3 text-sm font-normal text-gray-400">
                ({users.length} {users.length === 1 ? 'user' : 'users'})
              </span>
            </h3>
            
            {/* Search input for smaller screens */}
            <div className="relative w-full sm:w-64 group sm:hidden">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200
                  placeholder-gray-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-200" />
              
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full 
                    text-gray-400 hover:text-white hover:bg-gray-700/70 transition-all duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* User List component */}
          <UserList 
            users={users}
            loading={loading}
            currentPage={currentPage}
            searchQuery={searchQuery}
            promotingUserId={promotingUserId}
            demotingUserId={demotingUserId}
            removingUserId={removingUserId}
            onPromote={handlePromoteToAdmin}
            onDemote={handleDemoteToUser}
            onRemove={handleOpenRemoveModal}
            onPageChange={setCurrentPage}
          />
        </div>
        
        {/* User Role Information */}
        <UserRoleInfo />
        
        {/* Confirmation modal for user removal */}
        <ConfirmationModal
          isOpen={!!userToRemove}
          title="Remove User"
          description="Are you sure you want to remove this user? This action cannot be undone."
          warningMessage="All data associated with this user will be permanently deleted."
          confirmLabel="Remove User"
          cancelLabel="Cancel"
          isProcessing={removingUserId !== null}
          processingLabel="Removing..."
          onConfirm={confirmRemoveUser}
          onCancel={() => setUserToRemove(null)}
        />
      </div>
    </div>
  );
}