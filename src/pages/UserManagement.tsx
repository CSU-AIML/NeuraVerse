// pages/UserManagement/index.tsx - SIMPLIFIED DELETE VERSION
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserManagementHeader from './UserManagement/UserManagementHeader';
import UserSearchFilter from './UserManagement/UserSearchFilter';
import UserList from './UserManagement/UserList';
import UserRoleInfo from './UserManagement/UserRoleInfo';
import AlertMessage from './UserManagement/AlertMessage';
import ConfirmationModal from './UserManagement/ConfirmationModal';
import { 
  fetchUsers, 
  promoteToAdmin, 
  demoteToUser, 
  removeUser, 
  UserProfile 
} from './UserManagement/userManagementService';

// Uncomment this for debugging
// import DebugUserDelete from './UserManagement/DebugUserDelete';

export function UserManagement() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [demotingUserId, setDemotingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ 
    type: 'success' | 'error' | null, 
    message: string | null 
  } | null>(null);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Auto-clear alerts after 8 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

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
  const handleFetchUsers = async (showRefreshIndicator = false) => {
    if (!isAdmin) return;
    
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('Fetching users...');
      const { users: fetchedUsers, error } = await fetchUsers();
      
      if (error) {
        throw new Error(error);
      }
      
      console.log('Successfully fetched users:', fetchedUsers.length);
      setUsers(fetchedUsers);
      
      if (showRefreshIndicator) {
        setAlertMessage({
          type: 'success',
          message: `Successfully refreshed user list. Found ${fetchedUsers.length} users.`
        });
      }
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setAlertMessage({
        type: 'error',
        message: `Failed to load users: ${error.message || 'Unknown error occurred'}`
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenRemoveModal = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    console.log('Opening delete modal for user:', userToDelete?.email);
    setUserToRemove(userId);
  };

  const confirmRemoveUser = async () => {
    if (!userToRemove) return;
    
    const userToDelete = users.find(u => u.id === userToRemove);
    console.log('Confirming removal of user:', userToDelete?.email);
    
    await handleRemoveUser(userToRemove);
    setUserToRemove(null);
  };
  
  // Function to promote a user to admin
  const handlePromoteToAdmin = async (userId: string) => {
    if (!isAdmin) return;
    
    const userToPromote = users.find(u => u.id === userId);
    console.log('Promoting user to admin:', userToPromote?.email || userId);
    
    setPromotingUserId(userId);
    try {
      const { success, error } = await promoteToAdmin(userId);
      
      if (!success) {
        throw new Error(error as string);
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'admin' } 
          : user
      ));
      
      setAlertMessage({
        type: 'success',
        message: `User ${userToPromote?.email || userId} successfully promoted to admin`
      });
      
    } catch (error: any) {
      console.error('Error in promote to admin:', error);
      setAlertMessage({
        type: 'error',
        message: `Failed to promote user: ${error.message || 'Unknown error'}`
      });
    } finally {
      setPromotingUserId(null);
    }
  };

  // Function to demote admin to standard user
  const handleDemoteToUser = async (userId: string) => {
    if (!isAdmin) return;
    
    const userToDemote = users.find(u => u.id === userId);
    console.log('Demoting admin to user:', userToDemote?.email || userId);
    
    setDemotingUserId(userId);
    try {
      const { success, error } = await demoteToUser(userId);
      
      if (!success) {
        throw new Error(error as string);
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'user' } 
          : user
      ));
      
      setAlertMessage({
        type: 'success',
        message: `User ${userToDemote?.email || userId} successfully demoted to standard user`
      });
      
    } catch (error: any) {
      console.error('Error in demote to standard user:', error);
      setAlertMessage({
        type: 'error',
        message: `Failed to demote user: ${error.message || 'Unknown error'}`
      });
    } finally {
      setDemotingUserId(null);
    }
  };

  // SIMPLIFIED DELETE FUNCTION with better error handling
  const handleRemoveUser = async (userId: string) => {
    if (!isAdmin) {
      setAlertMessage({
        type: 'error',
        message: 'You do not have permission to delete users'
      });
      return;
    }
    
    const userToDelete = users.find(u => u.id === userId);
    console.log('Starting deletion for user:', userToDelete?.email);
    
    setRemovingUserId(userId);
    
    // Show immediate feedback
    setAlertMessage({
      type: 'success',
      message: `Deleting user ${userToDelete?.email || userId}... Please wait.`
    });
    
    try {
      const { success, error, deletedUser } = await removeUser(userId);
      
      if (!success) {
        throw new Error(error as string);
      }
      
      // Remove user from local state immediately
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      // Show success message
      setAlertMessage({
        type: 'success',
        message: `✅ User ${userToDelete?.email || userId} has been permanently removed. ${updatedUsers.length} users remaining.`
      });
      
      console.log('User successfully deleted from local state');
      
      // Optional: Refresh the list after a delay to ensure consistency
      setTimeout(() => {
        console.log('Auto-refreshing to ensure consistency...');
        handleFetchUsers(true);
      }, 3000);
      
    } catch (error: any) {
      console.error('Delete operation failed:', error);
      
      setAlertMessage({
        type: 'error',
        message: `❌ Failed to remove user: ${error.message}`
      });
      
      // Refresh the list to show current state
      handleFetchUsers(true);
      
    } finally {
      setRemovingUserId(null);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    console.log('Admin signing out...');
    await signOut();
    navigate('/signin');
  };

  // Handle refresh with indicator
  const handleRefresh = () => {
    console.log('Manual refresh triggered...');
    handleFetchUsers(true);
  };

  // If not admin, don't render anything
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <UserManagementHeader 
          user={user}
          isAdmin={isAdmin}
          onRefresh={handleRefresh}
          onSignOut={handleSignOut}
        />
        
        {/* Alert Messages */}
        {alertMessage && (
          <div className="relative mb-6">
            <AlertMessage 
              type={alertMessage.type} 
              message={alertMessage.message} 
            />
            <button
              onClick={() => setAlertMessage(null)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-700/50 rounded transition-colors"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Search and Filters */}
        <UserSearchFilter 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        {/* Debug Section - Uncomment this if you need to debug a specific user */}
        {/*
        {userToRemove && (
          <div className="mb-6">
            <DebugUserDelete 
              userId={userToRemove}
              userEmail={users.find(u => u.id === userToRemove)?.email || 'Unknown'}
            />
          </div>
        )}
        */}
        
        {/* User Table */}
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl 
          rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl 
          transition-all duration-300 hover:shadow-blue-900/20 relative">
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none"></div>
          
          {/* Table header */}
          <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/60 p-6 relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  User Management Dashboard
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {users.length} {users.length === 1 ? 'user' : 'users'} total
                  </span>
                  {loading && (
                    <span className="flex items-center gap-2 text-blue-400">
                      <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  )}
                  {refreshing && (
                    <span className="flex items-center gap-2 text-green-400">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Refreshing...
                    </span>
                  )}
                  {removingUserId && (
                    <span className="flex items-center gap-2 text-red-400">
                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      Deleting user...
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 
                  border border-blue-500/30 rounded-xl text-blue-300 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* User List */}
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
        
        {/* Confirmation modal */}
        <ConfirmationModal
          isOpen={!!userToRemove}
          title="🗑️ Permanently Delete User"
          description={`You are about to permanently delete "${
            users.find(u => u.id === userToRemove)?.email || 'this user'
          }" from the system.`}
          warningMessage="⚠️ CRITICAL WARNING: This action cannot be undone! The user will be completely removed from the database, including all associated data."
          confirmLabel="🗑️ DELETE PERMANENTLY"
          cancelLabel="Cancel"
          isProcessing={removingUserId !== null}
          processingLabel="Deleting user from database..."
          onConfirm={confirmRemoveUser}
          onCancel={() => setUserToRemove(null)}
        />
      </div>
    </div>
  );
}