// pages/UserManagement/UserList.tsx
import React from 'react';
import { ChevronDown, User, Shield, CalendarIcon, ClockIcon, UserCog, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';

interface UserProfile {
  avatar_url: any;
  id: string;
  display_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  email?: string;
}

interface UserListProps {
  users: UserProfile[];
  loading: boolean;
  currentPage: number;
  searchQuery: string;
  promotingUserId: string | null;
  demotingUserId: string | null;
  removingUserId: string | null;
  onPromote: (userId: string) => void;
  onDemote: (userId: string) => void;
  onRemove: (userId: string) => void;
  onPageChange: (page: number) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  loading,
  currentPage,
  searchQuery,
  promotingUserId,
  demotingUserId,
  removingUserId,
  onPromote,
  onDemote,
  onRemove,
  onPageChange
}) => {
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

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-800/50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-l-transparent border-r-transparent border-b-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 mt-4 text-lg">Loading user data...</p>
        <p className="text-gray-500 mt-1 text-sm">Please wait while we fetch the latest information</p>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto h-20 w-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-gray-500" />
        </div>
        <h3 className="text-gray-300 text-lg font-medium mb-2">No users found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {searchQuery 
            ? `No users match your search criteria "${searchQuery}". Try a different search term.` 
            : 'There are no users in the system yet. Add users to get started.'}
        </p>
      </div>
    );
  }

  return (
    <>
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
                    <CalendarIcon className="h-3 w-3 mr-1.5 text-gray-500" />
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
                          onClick={() => user.role === 'user' ? onPromote(user.id) : onDemote(user.id)}
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
                          onClick={() => onRemove(user.id)}
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

      {/* Table footer with pagination */}
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
        
        <Pagination 
          currentPage={currentPage}
          totalPages={Math.ceil(filteredUsers.length / 5)}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
};

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/40 shadow-lg">
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="relative overflow-hidden rounded-lg mr-1 border-0 text-gray-400 hover:text-white hover:bg-gray-700/80 disabled:opacity-50 disabled:bg-transparent"
      >
        <span className="relative z-10 flex items-center">
          <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Previous</span>
        </span>
      </Button>
      
      <div className="flex items-center px-2 border-x border-gray-700/40">
        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <span 
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
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
        
        {totalPages > 3 && (
          <>
            <span className="mx-1 text-gray-500">...</span>
            <span 
              onClick={() => onPageChange(totalPages)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-300 hover:bg-gray-700/70 hover:text-white transition-colors duration-150 cursor-pointer text-sm mx-0.5"
            >
              {totalPages}
            </span>
          </>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className="relative overflow-hidden rounded-lg ml-1 border-0 text-gray-400 hover:text-white hover:bg-gray-700/80 group disabled:opacity-50 disabled:bg-transparent"
      >
        <span className="relative z-10 flex items-center">
          <span className="font-medium">Next</span>
          <svg className="h-4 w-4 ml-1.5 transform group-hover:translate-x-0.5 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/5 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Button>
    </div>
  );
};

export default UserList;