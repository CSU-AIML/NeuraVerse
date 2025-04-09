// UserManagement/UserList.tsx
import React, { useState, useMemo } from 'react';
import { UserPlus, UserMinus, Trash2, ChevronDown, ChevronUp, MoreVertical, AlertCircle } from 'lucide-react';
import { UserRole } from '../../contexts/AuthContext';

// Updated interface to be more flexible with optional fields
export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  role: UserRole;
  avatar_url?: string; // Now optional to match service definition
  created_at?: string;
  updated_at?: string; // Now optional to match service definition
  last_login?: string;
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
  const [sortField, setSortField] = useState<keyof UserProfile>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  const usersPerPage = 10;
  
  // Handle sort change
  const handleSort = (field: keyof UserProfile) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    // First filter by search query
    let result = users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (user.display_name?.toLowerCase() || '').includes(searchLower) ||
        (user.email?.toLowerCase() || '').includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower)
      );
    });
    
    // Then sort by the selected field
    return result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      // Safely handle undefined values
      const valueA = fieldA !== undefined ? String(fieldA) : '';
      const valueB = fieldB !== undefined ? String(fieldB) : '';
      
      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [users, searchQuery, sortField, sortDirection]);
  
  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredAndSortedUsers, currentPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Toggle expanded user row
  const toggleExpandUser = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };
  
  return (
    <div className="overflow-hidden">
      {loading ? (
        <div className="p-8 text-center text-gray-400">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 border-opacity-50 rounded-full mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-500" />
          <h3 className="text-lg font-medium mb-1">No users found</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 
              `No users match the search term "${searchQuery}"` : 
              "There are no users in the system yet"}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-800/40 text-xs uppercase text-gray-400">
                <tr>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort('display_name')}
                  >
                    <div className="flex items-center">
                      User
                      {sortField === 'display_name' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      Role
                      {sortField === 'role' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Joined
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {paginatedUsers.map(user => (
                  <React.Fragment key={user.id}>
                    <tr className="bg-gray-900/30 hover:bg-gray-800/20 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-700/50 flex items-center justify-center text-blue-400 uppercase font-semibold overflow-hidden">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.display_name || 'User'} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{(user.display_name || 'U')[0]}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.display_name || 'Unknown User'}</div>
                            <div className="text-xs text-gray-400 md:hidden">{user.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">{user.email || 'No email'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-blue-900/30 text-blue-400 border border-blue-600/30' 
                            : 'bg-gray-800/50 text-gray-300 border border-gray-700/50'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm hidden md:table-cell">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {user.role === 'user' ? (
                            <button
                              onClick={() => onPromote(user.id)}
                              disabled={!!promotingUserId}
                              className={`p-1.5 rounded-lg text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 transition-colors
                                ${promotingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Promote to Admin"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onDemote(user.id)}
                              disabled={!!demotingUserId}
                              className={`p-1.5 rounded-lg text-orange-400 hover:bg-orange-900/20 hover:text-orange-300 transition-colors
                                ${demotingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Demote to Standard User"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onRemove(user.id)}
                            disabled={!!removingUserId}
                            className={`p-1.5 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors
                              ${removingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Remove User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => toggleExpandUser(user.id)}
                            className="block sm:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-800/40 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Mobile expanded view */}
                    {expandedUserId === user.id && (
                      <tr className="sm:hidden bg-gray-800/30">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="text-gray-400">Email:</div>
                            <div>{user.email || 'N/A'}</div>
                            
                            <div className="text-gray-400">Joined:</div>
                            <div>{formatDate(user.created_at)}</div>
                            
                            <div className="text-gray-400">Last login:</div>
                            <div>{formatDate(user.last_login)}</div>
                            
                            <div className="text-gray-400">ID:</div>
                            <div className="truncate">{user.id}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-800/20 border-t border-gray-800/40 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{(currentPage - 1) * usersPerPage + 1}</span> to <span className="font-medium text-white">
                  {Math.min(currentPage * usersPerPage, filteredAndSortedUsers.length)}
                </span> of <span className="font-medium text-white">{filteredAndSortedUsers.length}</span> users
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page 
                        ? 'bg-blue-600/70 text-white' 
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserList;