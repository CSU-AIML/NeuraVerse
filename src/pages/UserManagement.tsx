// src/pages/UserManagement/index.tsx - Fixed Enterprise-Grade User Management
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Download,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  FileDown,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import userManagementService, { UserProfile } from '../services/userManagementService';

// Enhanced interfaces
interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

interface BulkOperation {
  type: 'promote' | 'demote' | 'suspend' | 'delete' | 'export';
  userIds: string[];
  reason?: string;
  duration?: number;
}

interface UserFilter {
  role?: string;
  status?: string;
  searchQuery: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function UserManagement() {
  const navigate = useNavigate();
  const { isAdmin, signOut } = useAuth();
  
  // Core state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // UI state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Filtering and search
  const [filters, setFilters] = useState<UserFilter>({
    searchQuery: '',
    role: '',
    status: ''
  });
  
  // Operations state
  const [operationStates, setOperationStates] = useState<Record<string, boolean>>({});
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  
  // Forms state
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null);
  const [operationReason, setOperationReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState<number>(7);

  // Access control check
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  // Load users with error handling
  const loadUsers = useCallback(async (showRefreshIndicator = false) => {
    if (!isAdmin) return;
    
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fixed: Pass proper options object
      const result = await userManagementService.fetchUsers({
        page: 1,
        limit: 100,
      });
      
      if (result.success) {
        // Fixed: Use correct property names
        setUsers(result.data || result.users || []);
        
        // Check for security alerts
        checkForSecurityAlerts(result.data || result.users || []);
        
        if (showRefreshIndicator) {
          addSecurityAlert('info', `User list refreshed successfully. ${(result.data || result.users || []).length} users found.`);
        }
      } else {
        throw new Error(result.error || 'Failed to load users');
      }
      
    } catch (error: any) {
      console.error('Error loading users:', error);
      addSecurityAlert('error', `Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  // Security monitoring
  const checkForSecurityAlerts = useCallback((userList: UserProfile[]) => {
    const alerts: SecurityAlert[] = [];
    
    // Check for suspicious patterns
    const recentUsers = userList.filter(u => 
      u.created_at && new Date(u.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    if (recentUsers.length > 5) {
      alerts.push({
        id: `high-registrations-${Date.now()}`,
        type: 'warning',
        message: `${recentUsers.length} new users registered in the last 24 hours`,
        timestamp: new Date(),
        dismissed: false
      });
    }
    
    const suspendedUsers = userList.filter(u => u.account_status === 'suspended');
    if (suspendedUsers.length > 0) {
      alerts.push({
        id: `suspended-users-${Date.now()}`,
        type: 'info',
        message: `${suspendedUsers.length} users are currently suspended`,
        timestamp: new Date(),
        dismissed: false
      });
    }
    
    const unverifiedUsers = userList.filter(u => !u.email_verified);
    if (unverifiedUsers.length > userList.length * 0.3) {
      alerts.push({
        id: `unverified-users-${Date.now()}`,
        type: 'warning',
        message: `${unverifiedUsers.length} users have unverified email addresses`,
        timestamp: new Date(),
        dismissed: false
      });
    }
    
    setSecurityAlerts(prev => [...prev.filter(a => a.dismissed), ...alerts]);
  }, []);

  // Add security alert
  const addSecurityAlert = useCallback((type: SecurityAlert['type'], message: string) => {
    const alert: SecurityAlert = {
      id: `alert-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      dismissed: false
    };
    
    setSecurityAlerts(prev => [alert, ...prev]);
    
    // Auto-dismiss info alerts after 5 seconds
    if (type === 'info') {
      setTimeout(() => {
        setSecurityAlerts(prev => 
          prev.map(a => a.id === alert.id ? { ...a, dismissed: true } : a)
        );
      }, 5000);
    }
  }, []);

  // Handle user promotion with reason
  const handlePromoteUser = useCallback(async (userId: string, reason?: string) => {
    setOperationStates(prev => ({ ...prev, [`promote-${userId}`]: true }));
    
    try {
      const result = await userManagementService.promoteToAdmin(userId, reason);
      
      if (result.success) {
        setUsers(prev => prev.map(u => 
          u.firebase_uid === userId ? { ...u, role: 'admin' } : u
        ));
        addSecurityAlert('info', `User promoted to administrator successfully`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addSecurityAlert('error', `Failed to promote user: ${error.message}`);
    } finally {
      setOperationStates(prev => ({ ...prev, [`promote-${userId}`]: false }));
    }
  }, []);

  // Handle user demotion with reason
  const handleDemoteUser = useCallback(async (userId: string, reason?: string) => {
    setOperationStates(prev => ({ ...prev, [`demote-${userId}`]: true }));
    
    try {
      const result = await userManagementService.demoteToUser(userId, reason);
      
      if (result.success) {
        setUsers(prev => prev.map(u => 
          u.firebase_uid === userId ? { ...u, role: 'user' } : u
        ));
        addSecurityAlert('info', `Administrator demoted to user successfully`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addSecurityAlert('error', `Failed to demote user: ${error.message}`);
    } finally {
      setOperationStates(prev => ({ ...prev, [`demote-${userId}`]: false }));
    }
  }, []);

  // Handle user suspension
  const handleSuspendUser = useCallback(async (userId: string, reason: string, duration?: number) => {
    setOperationStates(prev => ({ ...prev, [`suspend-${userId}`]: true }));
    
    try {
      const result = await userManagementService.suspendUser(userId, reason, duration);
      
      if (result.success) {
        setUsers(prev => prev.map(u => 
          u.firebase_uid === userId ? { ...u, account_status: 'suspended' } : u
        ));
        addSecurityAlert('info', `User suspended successfully`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addSecurityAlert('error', `Failed to suspend user: ${error.message}`);
    } finally {
      setOperationStates(prev => ({ ...prev, [`suspend-${userId}`]: false }));
    }
  }, []);

  // Handle user deletion with GDPR compliance
  const handleDeleteUser = useCallback(async (userId: string, reason: string, gdprRequest = false) => {
    setOperationStates(prev => ({ ...prev, [`delete-${userId}`]: true }));
    
    try {
      const result = await userManagementService.deleteUser(userId, reason);
      
      if (result.success) {
        if (gdprRequest) {
          setUsers(prev => prev.filter(u => u.firebase_uid !== userId));
          addSecurityAlert('info', `User data permanently deleted (GDPR request)`);
        } else {
          setUsers(prev => prev.map(u => 
            u.firebase_uid === userId ? { ...u, account_status: 'deleted' } : u
          ));
          addSecurityAlert('info', `User account deleted successfully`);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addSecurityAlert('error', `Failed to delete user: ${error.message}`);
    } finally {
      setOperationStates(prev => ({ ...prev, [`delete-${userId}`]: false }));
    }
  }, []);

  // Handle data export for GDPR
  const handleExportUserData = useCallback(async (userId: string) => {
    try {
      const result = await userManagementService.exportUserData(userId);
      
      if (result.success) {
        // Create and download the data export
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        addSecurityAlert('info', `User data exported successfully`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addSecurityAlert('error', `Failed to export user data: ${error.message}`);
    }
  }, []);

  // Bulk operations handler
  const handleBulkOperation = useCallback(async () => {
    if (!bulkOperation || selectedUsers.size === 0) return;
    
    const userIds = Array.from(selectedUsers);
    setOperationStates(prev => ({ ...prev, 'bulk-operation': true }));
    
    try {
      switch (bulkOperation.type) {
        case 'promote':
          for (const userId of userIds) {
            await handlePromoteUser(userId, operationReason);
          }
          break;
          
        case 'suspend':
          for (const userId of userIds) {
            await handleSuspendUser(userId, operationReason, suspensionDuration);
          }
          break;
          
        case 'export':
          for (const userId of userIds) {
            await handleExportUserData(userId);
          }
          break;
          
        default:
          throw new Error('Unsupported bulk operation');
      }
      
      addSecurityAlert('info', `Bulk operation completed for ${userIds.length} users`);
      setSelectedUsers(new Set());
      setBulkOperation(null);
      setActiveModal(null);
      
    } catch (error: any) {
      addSecurityAlert('error', `Bulk operation failed: ${error.message}`);
    } finally {
      setOperationStates(prev => ({ ...prev, 'bulk-operation': false }));
    }
  }, [bulkOperation, selectedUsers, operationReason, suspensionDuration, handlePromoteUser, handleSuspendUser, handleExportUserData]);

  // Filter users based on current filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.searchQuery || 
      (user.display_name || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.account_status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // User selection handlers - Use firebase_uid instead of id
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(new Set(filteredUsers.map(u => u.firebase_uid)));
  }, [filteredUsers]);

  const clearSelection = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  // Access control
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 to-orange-950 flex items-center justify-center p-6">
        <div className="text-center bg-red-900/20 border border-red-800 rounded-2xl p-8">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-100 mb-2">Access Denied</h1>
          <p className="text-red-300">Administrator privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Enterprise User Management
              </h1>
              <p className="text-slate-400 mt-2">
                Secure user administration with full audit trail and GDPR compliance
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => loadUsers(true)}
                disabled={loading || refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-300 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-300 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Security Alerts */}
          {securityAlerts.filter(a => !a.dismissed).length > 0 && (
            <div className="space-y-2 mb-6">
              {securityAlerts.filter(a => !a.dismissed).map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex items-start justify-between ${
                    alert.type === 'error' 
                      ? 'bg-red-900/20 border-red-800/30 text-red-200'
                      : alert.type === 'warning'
                      ? 'bg-amber-900/20 border-amber-800/30 text-amber-200'
                      : 'bg-blue-900/20 border-blue-800/30 text-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {alert.type === 'error' ? (
                      <XCircle className="w-5 h-5 mt-0.5" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSecurityAlerts(prev => 
                      prev.map(a => a.id === alert.id ? { ...a, dismissed: true } : a)
                    )}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          
          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="mt-4 flex items-center justify-between p-4 bg-indigo-900/20 border border-indigo-800/30 rounded-xl">
              <div className="flex items-center gap-4">
                <span className="text-indigo-200">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Clear selection
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBulkOperation({ type: 'export', userIds: Array.from(selectedUsers) })}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                
                <button
                  onClick={() => setActiveModal('bulk-suspend')}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 rounded-lg text-amber-300 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Suspend
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">User Directory</h3>
                  <p className="text-slate-400 text-sm">
                    {filteredUsers.length} of {users.length} users
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={selectedUsers.size === filteredUsers.length ? clearSelection : selectAllUsers}
                  className="px-3 py-1.5 bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/30 rounded-lg text-sm transition-colors"
                >
                  {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-t-indigo-600 border-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No users found</h3>
              <p className="text-slate-500">
                {filters.searchQuery || filters.role || filters.status 
                  ? 'No users match your current filters' 
                  : 'No users in the system yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={selectedUsers.size === filteredUsers.length ? clearSelection : selectAllUsers}
                        className="w-4 h-4 text-indigo-600 border-slate-500 rounded focus:ring-indigo-500"
                      />
                    </th>
                    <th className="text-left p-4 text-slate-300 font-medium">User</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Role</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Last Login</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredUsers.map(userData => (
                    <tr 
                      key={userData.firebase_uid} 
                      className={`hover:bg-slate-700/20 transition-colors ${
                        selectedUsers.has(userData.firebase_uid) ? 'bg-indigo-900/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(userData.firebase_uid)}
                          onChange={() => toggleUserSelection(userData.firebase_uid)}
                          className="w-4 h-4 text-indigo-600 border-slate-500 rounded focus:ring-indigo-500"
                        />
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                            {userData.avatar_url ? (
                              <img 
                                src={userData.avatar_url} 
                                alt={userData.display_name || 'User'} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (userData.display_name || userData.email || 'U')[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{userData.display_name || 'No Name'}</div>
                            <div className="text-sm text-slate-400">{userData.email}</div>
                            {!userData.email_verified && (
                              <div className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3" />
                                Unverified
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                          userData.role === 'admin' 
                            ? 'bg-purple-900/30 text-purple-300 border border-purple-600/30'
                            : 'bg-slate-600/30 text-slate-300 border border-slate-500/30'
                        }`}>
                          {userData.role === 'admin' ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <Users className="w-3 h-3" />
                          )}
                          {userData.role === 'admin' ? 'Administrator' : 'User'}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                          userData.account_status === 'active' 
                            ? 'bg-green-900/30 text-green-300 border border-green-600/30'
                            : userData.account_status === 'suspended'
                            ? 'bg-amber-900/30 text-amber-300 border border-amber-600/30'
                            : 'bg-red-900/30 text-red-300 border border-red-600/30'
                        }`}>
                          {userData.account_status === 'active' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : userData.account_status === 'suspended' ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {userData.account_status === 'active' ? 'Active' : 
                           userData.account_status === 'suspended' ? 'Suspended' : 'Deleted'}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-slate-300">
                          {userData.last_login ? (
                            <>
                              <div>{new Date(userData.last_login).toLocaleDateString()}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(userData.last_login).toLocaleTimeString()}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-500">Never</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {userData.account_status === 'active' && (
                            <>
                              {userData.role === 'user' ? (
                                <button
                                  onClick={() => {
                                    setCurrentUser(userData);
                                    setActiveModal('promote');
                                  }}
                                  disabled={operationStates[`promote-${userData.firebase_uid}`]}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors"
                                  title="Promote to Admin"
                                >
                                  {operationStates[`promote-${userData.firebase_uid}`] ? (
                                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Shield className="w-4 h-4" />
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setCurrentUser(userData);
                                    setActiveModal('demote');
                                  }}
                                  disabled={operationStates[`demote-${userData.firebase_uid}`]}
                                  className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 rounded-lg transition-colors"
                                  title="Demote to User"
                                >
                                  {operationStates[`demote-${userData.firebase_uid}`] ? (
                                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Users className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  setCurrentUser(userData);
                                  setActiveModal('suspend');
                                }}
                                disabled={operationStates[`suspend-${userData.firebase_uid}`]}
                                className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 rounded-lg transition-colors"
                                title="Suspend User"
                              >
                                {operationStates[`suspend-${userData.firebase_uid}`] ? (
                                  <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Pause className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleExportUserData(userData.firebase_uid)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Export User Data"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setCurrentUser(userData);
                              setActiveModal('delete');
                            }}
                            disabled={operationStates[`delete-${userData.firebase_uid}`]}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            {operationStates[`delete-${userData.firebase_uid}`] ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setCurrentUser(userData);
                              setActiveModal('user-details');
                            }}
                            className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* User Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{users.length}</div>
                <div className="text-slate-400 text-sm">Total Users</div>
              </div>
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {users.filter(u => u.account_status === 'active').length}
                </div>
                <div className="text-slate-400 text-sm">Active Users</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-slate-400 text-sm">Administrators</div>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {users.filter(u => u.account_status === 'suspended').length}
                </div>
                <div className="text-slate-400 text-sm">Suspended</div>
              </div>
              <Pause className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple Modal for Actions */}
      {activeModal && currentUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                {activeModal === 'delete' ? 'Delete User' :
                 activeModal === 'suspend' ? 'Suspend User' :
                 activeModal === 'promote' ? 'Promote User' :
                 activeModal === 'demote' ? 'Demote User' :
                 'User Details'}
              </h3>
              
              {/* Modal content based on type */}
              {activeModal === 'delete' && (
                <div>
                  <p className="text-slate-300 mb-4">
                    Are you sure you want to delete {currentUser.display_name || currentUser.email}?
                  </p>
                  <div className="mb-4">
                    <textarea
                      placeholder="Reason for deletion (required)"
                      value={operationReason}
                      onChange={(e) => setOperationReason(e.target.value)}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        setOperationReason('');
                      }}
                      className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteUser(currentUser.firebase_uid, operationReason);
                        setActiveModal(null);
                        setOperationReason('');
                      }}
                      disabled={!operationReason.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 rounded-lg text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'suspend' && (
                <div>
                  <p className="text-slate-300 mb-4">
                    Suspend {currentUser.display_name || currentUser.email}?
                  </p>
                  <div className="mb-4">
                    <textarea
                      placeholder="Reason for suspension (required)"
                      value={operationReason}
                      onChange={(e) => setOperationReason(e.target.value)}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Suspension Duration (days)
                    </label>
                    <input
                      type="number"
                      value={suspensionDuration}
                      onChange={(e) => setSuspensionDuration(Number(e.target.value))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      min="1"
                      max="365"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        setOperationReason('');
                      }}
                      className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSuspendUser(currentUser.firebase_uid, operationReason, suspensionDuration);
                        setActiveModal(null);
                        setOperationReason('');
                      }}
                      disabled={!operationReason.trim()}
                      className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 rounded-lg text-white transition-colors"
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              )}

              {(activeModal === 'promote' || activeModal === 'demote') && (
                <div>
                  <p className="text-slate-300 mb-4">
                    {activeModal === 'promote' 
                      ? `Promote ${currentUser.display_name || currentUser.email} to administrator?`
                      : `Demote ${currentUser.display_name || currentUser.email} to regular user?`
                    }
                  </p>
                  <div className="mb-4">
                    <textarea
                      placeholder="Reason (optional)"
                      value={operationReason}
                      onChange={(e) => setOperationReason(e.target.value)}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        setOperationReason('');
                      }}
                      className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (activeModal === 'promote') {
                          handlePromoteUser(currentUser.firebase_uid, operationReason);
                        } else {
                          handleDemoteUser(currentUser.firebase_uid, operationReason);
                        }
                        setActiveModal(null);
                        setOperationReason('');
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                        activeModal === 'promote' 
                          ? 'bg-green-600 hover:bg-green-500' 
                          : 'bg-amber-600 hover:bg-amber-500'
                      }`}
                    >
                      {activeModal === 'promote' ? 'Promote' : 'Demote'}
                    </button>
                  </div>
                </div>
              )}

              {/* User details modal */}
              {activeModal === 'user-details' && (
                <div className="text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Firebase UID:</span>
                      <span className="text-white font-mono text-sm">{currentUser.firebase_uid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white">{currentUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Display Name:</span>
                      <span className="text-white">{currentUser.display_name || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role:</span>
                      <span className="text-white capitalize">{currentUser.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-white capitalize">{currentUser.account_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email Verified:</span>
                      <span className="text-white">{currentUser.email_verified ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Provider:</span>
                      <span className="text-white">{currentUser.provider || 'password'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white">{new Date(currentUser.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Login:</span>
                      <span className="text-white">
                        {currentUser.last_login 
                          ? new Date(currentUser.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full mt-6 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}