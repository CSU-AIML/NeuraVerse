// UserManagement/UserList.tsx - FIXED VERSION (minimal, existing columns only)
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  UserMinus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  AlertCircle,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  User
} from 'lucide-react';
import { UserRole } from '../../contexts/AuthContext';

// Simplified interface to match your actual database schema
export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  role: UserRole;
  avatar_url: string;
  created_at?: string;
  updated_at: string;
  last_login?: string;
  _databaseId?: number;
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
  const [showEmails, setShowEmails] = useState(true);
  
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

  // Get user stats for admin dashboard
  const userStats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      users: users.filter(u => u.role === 'user').length
    };
  }, [users]);
  
  return (
    <div className="overflow-hidden">
      {/* Admin Controls Header */}
      <div className="bg-slate-800/30 border-b border-slate-700/30 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-300">
            <span className="font-medium">Total:</span> {userStats.total} | 
            <span className="font-medium text-blue-400 ml-2">Admins:</span> {userStats.admins} | 
            <span className="font-medium text-green-400 ml-2">Users:</span> {userStats.users}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmails(!showEmails)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 
              border border-slate-600/30 rounded-lg text-sm transition-colors"
          >
            {showEmails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showEmails ? 'Hide Emails' : 'Show Emails'}
          </button>
        </div>
      </div>

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
          {/* Simplified Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-800/40 text-xs uppercase text-gray-400">
                <tr>
                  <th 
                    className="px-4 py-4 cursor-pointer hover:bg-gray-700/30"
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
                  {showEmails && (
                    <th 
                      className="px-4 py-4 cursor-pointer hover:bg-gray-700/30 hidden md:table-cell"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                  )}
                  <th 
                    className="px-4 py-4 cursor-pointer hover:bg-gray-700/30"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Role
                      {sortField === 'role' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 cursor-pointer hover:bg-gray-700/30 hidden md:table-cell"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {paginatedUsers.map(user => (
                  <React.Fragment key={user.id}>
                    <tr className="bg-gray-900/30 hover:bg-gray-800/40 transition-colors duration-200">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                            flex items-center justify-center text-white font-semibold overflow-hidden border-2 border-slate-600/30">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.display_name || 'User'} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`${user.avatar_url ? 'hidden' : 'flex'} items-center justify-center h-full w-full`}>
                              <span>{(user.display_name || user.email || 'U')[0].toUpperCase()}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {user.display_name || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                            {/* Show email on mobile if emails are visible */}
                            {showEmails && (
                              <div className="text-xs text-gray-400 md:hidden">
                                {user.email || 'No email'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {showEmails && (
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-sm">{user.email || 'No email'}</span>
                        </td>
                      )}
                      
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 border border-blue-500/30' 
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                        }`}>
                          {user.role === 'admin' ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4 text-sm hidden md:table-cell">
                        <div className="text-gray-300">
                          {formatDate(user.created_at)}
                        </div>
                        {user.last_login && (
                          <div className="text-xs text-gray-400">
                            Last: {formatDate(user.last_login)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {user.role === 'user' ? (
                            <button
                              onClick={() => onPromote(user.id)}
                              disabled={!!promotingUserId}
                              className={`p-2 rounded-lg text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 
                                transition-all duration-200 border border-transparent hover:border-blue-500/30 ${
                                promotingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Promote to Admin"
                            >
                              {promotingUserId === user.id ? (
                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => onDemote(user.id)}
                              disabled={!!demotingUserId}
                              className={`p-2 rounded-lg text-orange-400 hover:bg-orange-900/30 hover:text-orange-300 
                                transition-all duration-200 border border-transparent hover:border-orange-500/30 ${
                                demotingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Demote to Standard User"
                            >
                              {demotingUserId === user.id ? (
                                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={() => onRemove(user.id)}
                            disabled={!!removingUserId}
                            className={`p-2 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 
                              transition-all duration-200 border border-transparent hover:border-red-500/30 ${
                              removingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Remove User"
                          >
                            {removingUserId === user.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button 
                            onClick={() => toggleExpandUser(user.id)}
                            className="block sm:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800/40 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Mobile expanded view */}
                    {expandedUserId === user.id && (
                      <tr className="sm:hidden bg-slate-800/40">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {showEmails && (
                                <>
                                  <div className="text-gray-400">Email:</div>
                                  <div>{user.email || 'N/A'}</div>
                                </>
                              )}
                              
                              <div className="text-gray-400">Joined:</div>
                              <div>{formatDate(user.created_at)}</div>
                              
                              <div className="text-gray-400">Last login:</div>
                              <div>{formatDate(user.last_login)}</div>
                              
                              <div className="text-gray-400">Full ID:</div>
                              <div className="truncate font-mono text-xs">{user.id}</div>
                            </div>
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
            <div className="px-4 py-4 bg-slate-800/30 border-t border-slate-700/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{(currentPage - 1) * usersPerPage + 1}</span> to{' '}
                <span className="font-medium text-white">
                  {Math.min(currentPage * usersPerPage, filteredAndSortedUsers.length)}
                </span> of{' '}
                <span className="font-medium text-white">{filteredAndSortedUsers.length}</span> users
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    currentPage === 1 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        currentPage === page 
                          ? 'bg-blue-600/70 text-white border border-blue-500/50' 
                          : 'text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    currentPage === totalPages 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
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