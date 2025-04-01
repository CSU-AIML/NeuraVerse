import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Users, ArrowLeft, RefreshCw, UserCog, User, Check, X, Search, Info, ChevronDown, CalendarIcon, ClockIcon, Trash2, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';

interface UserProfile {
  avatar_url: any;
  id: string;
  display_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  email?: string;
}

export function UserManagement() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [demotingUserId, setDemotingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  

  // Only admins can access this page
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Fetch all users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch user profiles
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch user profiles from public.user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profileError) {
        console.error('Error fetching user profiles:', profileError);
        throw profileError;
      }

      // For each profile, we'll try to get the email from auth.users if possible
      // Note: This may not work if you don't have proper permissions
      // but we can still display the profiles without emails
      
      setUsers(profileData || []);
      
      // Try to enrich with emails if possible
      const enrichedUsers = [...profileData || []];
      
      try {
        // Attempt to get auth emails through a view or function if available
        // This might fail based on permissions
        const { data: authData, error: authError } = await supabase
          .from('user_emails')  // This would be a view or function you'd need to create
          .select('user_id, email');
          
        if (!authError && authData) {
          // Merge in the email data
          enrichedUsers.forEach(user => {
            const emailRecord = authData.find(e => e.user_id === user.id);
            if (emailRecord) {
              user.email = emailRecord.email;
            }
          });
          
          setUsers(enrichedUsers);
        }
      } catch (error) {
        // Silently continue without emails if this fails
        console.log('Could not fetch user emails - continuing with profiles only');
      }
      
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

  const handleRemoveUser = (user_id: string) => {
    setUserToRemove(user_id);
  };

  const confirmRemoveUser = async () => {
    if (userToRemove) {
      await removeUser(userToRemove);
      setUserToRemove(null);
    }
  };
  
  // Function to promote a user to admin
  const promoteToAdmin = async (userId: string) => {
    setPromotingUserId(userId);
    try {
      // Directly update the user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (error) {
        console.error('Error promoting user:', error);
        setAlertMessage({
          type: 'error',
          message: `Failed to promote user: ${error.message}`
        });
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
    } finally {
      setPromotingUserId(null);
    }
  };

  // Function to demote admin to standard user
  const demoteToUser = async (userId: string) => {
    setDemotingUserId(userId);
    try {
      // Update the user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'user' })
        .eq('id', userId);
      
      if (error) {
        console.error('Error demoting user:', error);
        setAlertMessage({
          type: 'error',
          message: `Failed to demote user: ${error.message}`
        });
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
    } finally {
      setDemotingUserId(null);
    }
  };

  // Function to remove a user
  const removeUser = async (userId: string) => {
    // First, confirm the action
    if (!window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      return;
    }
    
    setRemovingUserId(userId);
    try {
      // First, delete from user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error removing user profile:', profileError);
        setAlertMessage({
          type: 'error',
          message: `Failed to remove user: ${profileError.message}`
        });
        throw profileError;
      }
      
      // Then try to delete from user_settings if it exists
      try {
        await supabase
          .from('user_settings')
          .delete()
          .eq('user_id', userId);
      } catch (settingsError) {
        // If this fails, we can still continue
        console.warn('Could not remove user settings:', settingsError);
      }
      
      // Try to delete from admin_permissions if it exists
      try {
        await supabase
          .from('admin_permissions')
          .delete()
          .eq('user_id', userId);
      } catch (permissionsError) {
        // If this fails, we can still continue
        console.warn('Could not remove admin permissions:', permissionsError);
      }
      
      // Update the local state
      setUsers(users.filter(user => user.id !== userId));
      
      setAlertMessage({
        type: 'success',
        message: 'User successfully removed'
      });
      
    } catch (error) {
      console.error('Error in remove user:', error);
    } finally {
      setRemovingUserId(null);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (user.email?.toLowerCase().includes(query) || false) ||
      user.display_name.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  const displayedUsers = filteredUsers.slice((currentPage - 1) * 5, currentPage * 5);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Generate an email-like display name if email is missing
  const getDisplayName = (user: UserProfile) => {
    if (user.display_name && user.display_name !== 'User') {
      return user.display_name;
    }
    
    // If we have an email, use the part before @
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    // Fallback to a user ID based name
    return `User ${user.id.substring(0, 8)}`;
  };

  

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')} // Change from navigate('/') to navigate('/dashboard')
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                User Management
              </h1>
              <p className="text-gray-400 mt-1">
                Manage user accounts and permissions
              </p>
            </div>
            
            <Button
              onClick={fetchUsers}
              className="flex items-center gap-2 backdrop-blur-xl shadow-lg border border-purple-500/30 bg-purple-600/40 text-white hover:bg-purple-500/60 hover:border-purple-400/50 hover:shadow-purple-500/30 hover:scale-105 hover:translate-y-[-2px] transition-all duration-300 group"
            >
              <RefreshCw className="w-4 h-4 group-hover:animate-spin " />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Alert Message */}
        {alertMessage && (
          <Alert className={`mb-6 ${alertMessage.type === 'success' ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'}`}>
            {alertMessage.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <AlertTitle>
              {alertMessage.type === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>
              {alertMessage.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        
        {/* Note about email visibility */}
        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <p className="text-sm text-blue-300 flex items-start">
            <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>User emails may not be visible depending on database permissions. This doesn't affect your ability to manage user roles.</span>
          </p>
        </div>
        
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
                ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
              </span>
            </h3>
            
            {/* Search input with animated clear button */}
            <div className="relative w-full sm:w-64 group">
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

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-800/50"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-l-transparent border-r-transparent border-b-transparent animate-spin"></div>
              </div>
              <p className="text-gray-400 mt-4 text-lg">Loading user data...</p>
              <p className="text-gray-500 mt-1 text-sm">Please wait while we fetch the latest information</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-20 w-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-gray-300 text-lg font-medium mb-2">No users found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? `No users match your search criteria "${searchQuery}". Try a different search term.` 
                  : 'There are no users in the system yet. Add users to get started.'}
              </p>
              
              <button 
                className="mt-6 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors duration-200 inline-flex items-center"
                onClick={() => {/* Add function to add new user */}}
              >
                <span className="mr-1">+</span> Add New User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/80 border-b border-gray-700/50 text-left">
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer hover:text-blue-400 transition-colors duration-200">
                        User
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer hover:text-blue-400 transition-colors duration-200">
                        Role
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      <div className="flex items-center cursor-pointer hover:text-blue-400 transition-colors duration-200">
                        Joined
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      <div className="flex items-center cursor-pointer hover:text-blue-400 transition-colors duration-200">
                        Last Updated
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {displayedUsers.map((user, index) => (
                    <tr key={user.id} 
                      className={`group hover:bg-blue-900/10 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-900/30'
                      }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-blue-600/30 transition-all duration-200">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={getDisplayName(user)} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors duration-200 truncate max-w-[150px] sm:max-w-xs">
                              {getDisplayName(user)}
                            </div>
                            {user.email && (
                              <div className="text-sm text-gray-400 truncate max-w-[150px] sm:max-w-xs">
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.role === 'admin'
                            ? 'bg-purple-900/20 text-purple-300 border-purple-700/30 group-hover:bg-purple-900/30'
                            : 'bg-blue-900/20 text-blue-300 border-blue-700/30 group-hover:bg-blue-900/30'
                        } transition-colors duration-200`}>
                          {user.role === 'admin' ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1.5 text-gray-500" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden lg:table-cell">
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1.5 text-gray-500" />
                          {formatDate(user.updated_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => user.role === 'user' ? promoteToAdmin(user.id) : demoteToUser(user.id)}
                                disabled={promotingUserId === user.id || demotingUserId === user.id}
                                className={`${
                                  user.role === 'user' 
                                    ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                                    : 'text-orange-400 hover:text-orange-300 hover:bg-orange-900/20'
                                } opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100`}
                              >
                                {promotingUserId === user.id || demotingUserId === user.id ? (
                                  <div className="flex items-center">
                                    <div className={`h-4 w-4 border-2 ${
                                      user.role === 'user' 
                                        ? 'border-t-blue-500 border-r-blue-500 border-b-blue-500' 
                                        : 'border-t-orange-500 border-r-orange-500 border-b-orange-500'
                                    } border-l-transparent rounded-full animate-spin mr-2`}></div>
                                    {user.role === 'user' ? 'Promoting...' : 'Demoting...'}
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    {user.role === 'user' ? (
                                      <UserCog className="h-4 w-4 mr-1.5" />
                                    ) : (
                                      <User className="h-4 w-4 mr-1.5" />
                                    )}
                                    {user.role === 'user' ? 'Promote' : 'Demote'}
                                  </div>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {user.role === 'user' ? "Promote to Admin" : "Demote to User"}
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveUser(user.id)}
                                disabled={removingUserId === user.id}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100"
                              >
                                {removingUserId === user.id ? (
                                  <div className="flex items-center">
                                    <div className="h-4 w-4 border-2 border-t-red-500 border-r-red-500 border-b-red-500 border-l-transparent rounded-full animate-spin mr-2"></div>
                                    Removing...
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    Remove
                                  </div>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Remove User
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Table footer with pagination */}
          {!loading && filteredUsers.length > 0 && (
            <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-md border-t border-gray-700/40 px-6 py-5 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-400 mb-4 sm:mb-0 bg-gray-800/40 px-4 py-2 rounded-lg border border-gray-700/30 shadow-inner">
                <span className="text-gray-500">Showing </span>
                <span className="font-semibold text-blue-400">
                  {currentPage * 5 - 4}-{Math.min(currentPage * 5, filteredUsers.length)}
                </span>
                <span className="text-gray-500"> of </span>
                <span className="font-semibold text-white">{filteredUsers.length}</span>
                <span className="text-gray-500"> users</span>
              </div>
              
              <div className="flex items-center bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/40 shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="relative overflow-hidden rounded-lg mr-1 border-0 text-gray-400 hover:text-white hover:bg-gray-700/80 disabled:opacity-50 disabled:bg-transparent"
                >
                  <span className="relative z-10 flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Previous</span>
                  </span>
                </Button>
                
                <div className="flex items-center px-2 border-x border-gray-700/40">
                  {Array.from({ length: Math.min(3, Math.ceil(filteredUsers.length / 5)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <span 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium mx-0.5 cursor-pointer transition-all duration-150 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20"
                            : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </span>
                    );
                  })}
                  
                  {Math.ceil(filteredUsers.length / 5) > 3 && (
                    <>
                      <span className="mx-1 text-gray-500">...</span>
                      <span 
                        onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / 5))}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-300 hover:bg-gray-700/70 hover:text-white transition-colors duration-150 cursor-pointer text-sm mx-0.5"
                      >
                        {Math.ceil(filteredUsers.length / 5)}
                      </span>
                    </>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage >= Math.ceil(filteredUsers.length / 5)}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / 5)))}
                  className="relative overflow-hidden rounded-lg ml-1 border-0 text-gray-400 hover:text-white hover:bg-gray-700/80 group disabled:opacity-50 disabled:bg-transparent"
                >
                  <span className="relative z-10 flex items-center">
                    <span className="font-medium">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/5 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>
            </div>
          )}
          
          {/* Confirmation modal for user removal */}
          <Dialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
            <DialogContent className="bg-gray-900 border border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Remove User</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Are you sure you want to remove this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-gray-800/50 p-4 rounded-lg my-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <p className="text-amber-300 text-sm">
                    All data associated with this user will be permanently deleted.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setUserToRemove(null)}
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmRemoveUser}
                  disabled={removingUserId !== null}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  {removingUserId ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-t-white border-r-white border-b-white border-l-transparent rounded-full animate-spin mr-2"></div>
                      Removing...
                    </div>
                  ) : (
                    "Remove User"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Help Information */}
        <div className="mt-8 p-6 bg-gray-900/60 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-white">About User Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="flex items-center text-blue-400 font-medium">
                <User className="h-5 w-5 mr-2" />
                Standard Users
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span>Can browse and use existing projects</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span>Can access project documentation</span>
                </li>
                <li className="flex items-start">
                  <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                  <span>Cannot create or modify projects</span>
                </li>
                <li className="flex items-start">
                  <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                  <span>Cannot manage other users</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="flex items-center text-purple-400 font-medium">
                <Shield className="h-5 w-5 mr-2" />
                Admin Users
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Can create new projects</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Can edit and delete existing projects</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Can promote regular users to admin role</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Full access to all system features</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* New section for user management actions */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-lg font-medium mb-4 text-white">User Management Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="flex items-center text-blue-400 font-medium">
                  <UserCog className="h-5 w-5 mr-2" />
                  Promote User
                </h4>
                <p className="text-sm text-gray-300">
                  Grants administrative privileges to a standard user, allowing them to manage projects and other users.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="flex items-center text-orange-400 font-medium">
                  <User className="h-5 w-5 mr-2" />
                  Demote Admin
                </h4>
                <p className="text-sm text-gray-300">
                  Removes administrative privileges, converting an admin back to a standard user with limited access.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="flex items-center text-red-400 font-medium">
                  <X className="h-5 w-5 mr-2" />
                  Remove User
                </h4>
                <p className="text-sm text-gray-300">
                  Permanently removes a user from the system. This action cannot be undone and will delete all user data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}