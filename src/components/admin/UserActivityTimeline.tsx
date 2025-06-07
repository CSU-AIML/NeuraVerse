// components/admin/UserActivityTimeline.tsx - Detailed User Activity History
import { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Monitor,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Info,
  Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ActivityEvent {
  id: string;
  event_type: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  location_country?: string;
  location_city?: string;
  risk_score?: number;
  success: boolean;
  details: any;
  source_table: 'security_events' | 'audit_logs';
}

interface UserActivityTimelineProps {
  userId: string;
  userEmail?: string;
  userName?: string;
  onClose?: () => void;
}

interface TimelineFilters {
  eventTypes: string[];
  riskLevels: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
  showSuccessOnly: boolean;
  showFailuresOnly: boolean;
}

const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({
  userId,
  userEmail,
  userName,
  onClose
}) => {
  const { user } = useAuth();
  const role = user?.role;
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [filters, setFilters] = useState<TimelineFilters>({
    eventTypes: [],
    riskLevels: [],
    dateRange: { start: null, end: null },
    searchQuery: '',
    showSuccessOnly: false,
    showFailuresOnly: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  
  const eventsPerPage = 20;

  // Check admin permission
  useEffect(() => {
    if (role !== 'admin') return;
    loadUserActivity();
  }, [role, userId, currentPage, filters]);

  const loadUserActivity = async () => {
    if (role !== 'admin') return;
    
    setLoading(true);
    try {
      const [securityEvents, auditEvents] = await Promise.all([
        loadSecurityEvents(),
        loadAuditEvents()
      ]);

      // Combine and sort events by timestamp
      const allEvents = [...securityEvents, ...auditEvents]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setEvents(allEvents);
      setTotalEvents(allEvents.length);
      
    } catch (error) {
      console.error('Error loading user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async (): Promise<ActivityEvent[]> => {
    try {
      let query = supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply date filters
      if (filters.dateRange.start) {
        query = query.gte('created_at', filters.dateRange.start.toISOString());
      }
      if (filters.dateRange.end) {
        query = query.lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query.limit(1000); // Reasonable limit

      if (error) throw error;

      return (data || []).map(event => ({
        ...event,
        source_table: 'security_events' as const
      }));
    } catch (error) {
      console.error('Error loading security events:', error);
      return [];
    }
  };

  const loadAuditEvents = async (): Promise<ActivityEvent[]> => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false });

      // Apply date filters
      if (filters.dateRange.start) {
        query = query.gte('created_at', filters.dateRange.start.toISOString());
      }
      if (filters.dateRange.end) {
        query = query.lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;

      return (data || []).map(event => ({
        id: event.id,
        event_type: event.action,
        created_at: event.created_at,
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        success: event.success !== false,
        details: event.details || {},
        source_table: 'audit_logs' as const,
        risk_score: 0 // Audit logs don't have risk scores
      }));
    } catch (error) {
      console.error('Error loading audit events:', error);
      return [];
    }
  };

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Event type filter
    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter(event => filters.eventTypes.includes(event.event_type));
    }

    // Risk level filter
    if (filters.riskLevels.length > 0) {
      filtered = filtered.filter(event => {
        const riskScore = event.risk_score || 0;
        return filters.riskLevels.some(level => {
          switch (level) {
            case 'low': return riskScore < 30;
            case 'medium': return riskScore >= 30 && riskScore < 70;
            case 'high': return riskScore >= 70;
            default: return true;
          }
        });
      });
    }

    // Success/failure filter
    if (filters.showSuccessOnly) {
      filtered = filtered.filter(event => event.success);
    } else if (filters.showFailuresOnly) {
      filtered = filtered.filter(event => !event.success);
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.event_type.toLowerCase().includes(query) ||
        event.ip_address?.toLowerCase().includes(query) ||
        event.location_city?.toLowerCase().includes(query) ||
        event.location_country?.toLowerCase().includes(query) ||
        JSON.stringify(event.details).toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [events, filters]);

  // Paginate filtered events
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    return filteredEvents.slice(startIndex, startIndex + eventsPerPage);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const getEventIcon = (eventType: string, success: boolean) => {
    const iconProps = { className: "w-4 h-4" };
    
    if (!success) {
      return <XCircle {...iconProps} className="w-4 h-4 text-red-400" />;
    }

    switch (eventType) {
      case 'login_success':
        return <CheckCircle {...iconProps} className="w-4 h-4 text-green-400" />;
      case 'login_failed':
        return <XCircle {...iconProps} className="w-4 h-4 text-red-400" />;
      case 'password_change':
        return <Lock {...iconProps} className="w-4 h-4 text-blue-400" />;
      case 'role_change':
      case 'user_promoted':
      case 'user_demoted':
        return <Shield {...iconProps} className="w-4 h-4 text-purple-400" />;
      case 'account_suspended':
      case 'user_suspended':
        return <UserX {...iconProps} className="w-4 h-4 text-orange-400" />;
      case 'account_deleted':
      case 'user_deleted':
        return <UserX {...iconProps} className="w-4 h-4 text-red-400" />;
      case 'data_export':
        return <Download {...iconProps} className="w-4 h-4 text-cyan-400" />;
      case 'permission_denied':
        return <AlertTriangle {...iconProps} className="w-4 h-4 text-yellow-400" />;
      case 'device_change':
        return <Monitor {...iconProps} className="w-4 h-4 text-indigo-400" />;
      case 'suspicious_activity':
        return <AlertTriangle {...iconProps} className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity {...iconProps} className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventColor = (eventType: string, success: boolean, riskScore?: number) => {
    if (!success) return 'border-red-500/30 bg-red-900/10';
    
    if (riskScore && riskScore >= 70) return 'border-orange-500/30 bg-orange-900/10';
    if (riskScore && riskScore >= 30) return 'border-yellow-500/30 bg-yellow-900/10';
    
    switch (eventType) {
      case 'login_success':
        return 'border-green-500/30 bg-green-900/10';
      case 'role_change':
      case 'user_promoted':
        return 'border-purple-500/30 bg-purple-900/10';
      case 'account_suspended':
        return 'border-orange-500/30 bg-orange-900/10';
      case 'account_deleted':
        return 'border-red-500/30 bg-red-900/10';
      default:
        return 'border-slate-500/30 bg-slate-900/10';
    }
  };

  const formatEventTitle = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatEventDetails = (event: ActivityEvent) => {
    const details = [];
    
    if (event.ip_address) {
      details.push(`IP: ${event.ip_address}`);
    }
    
    if (event.location_city && event.location_country) {
      details.push(`Location: ${event.location_city}, ${event.location_country}`);
    }
    
    if (event.risk_score !== undefined && event.risk_score > 0) {
      details.push(`Risk Score: ${event.risk_score}`);
    }
    
    if (event.details?.reason) {
      details.push(`Reason: ${event.details.reason}`);
    }
    
    return details.join(' • ');
  };

  const exportTimeline = () => {
    const exportData = {
      user: {
        id: userId,
        email: userEmail,
        name: userName
      },
      export_date: new Date().toISOString(),
      total_events: filteredEvents.length,
      events: filteredEvents.map(event => ({
        timestamp: event.created_at,
        event_type: event.event_type,
        success: event.success,
        ip_address: event.ip_address,
        location: event.location_city ? `${event.location_city}, ${event.location_country}` : undefined,
        risk_score: event.risk_score,
        details: event.details,
        source: event.source_table
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-activity-${userId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-300">Administrator privileges required</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            Activity Timeline
          </h2>
          <p className="text-slate-400 mt-1">
            {userName || userEmail || `User ${userId}`} • {filteredEvents.length} events
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadUserActivity}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-indigo-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportTimeline}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-emerald-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600/20 hover:bg-slate-600/30 border border-slate-500/30 rounded-lg text-slate-300 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Close
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search Events</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by type, IP, location..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value ? new Date(e.target.value) : null }
                }))}
                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="date"
                value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value ? new Date(e.target.value) : null }
                }))}
                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Event Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  showSuccessOnly: !prev.showSuccessOnly,
                  showFailuresOnly: false
                }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.showSuccessOnly
                    ? 'bg-green-600/30 text-green-300 border border-green-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                }`}
              >
                Success Only
              </button>
              <button
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  showFailuresOnly: !prev.showFailuresOnly,
                  showSuccessOnly: false
                }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.showFailuresOnly
                    ? 'bg-red-600/30 text-red-300 border border-red-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                }`}
              >
                Failures Only
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <span>Total: {filteredEvents.length}</span>
          <span>Success: {filteredEvents.filter(e => e.success).length}</span>
          <span>Failed: {filteredEvents.filter(e => !e.success).length}</span>
          <span>High Risk: {filteredEvents.filter(e => (e.risk_score || 0) >= 70).length}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-t-blue-500 border-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading activity timeline...</p>
          </div>
        ) : paginatedEvents.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Activity Found</h3>
            <p className="text-slate-500">
              {filters.searchQuery || filters.eventTypes.length > 0 || filters.riskLevels.length > 0
                ? 'No events match your current filters'
                : 'No activity recorded for this user'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="space-y-4">
                {paginatedEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className={`relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 hover:bg-slate-700/20 cursor-pointer ${getEventColor(event.event_type, event.success, event.risk_score)}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Timeline line */}
                    {index < paginatedEvents.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-600/50"></div>
                    )}
                    
                    {/* Event icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
                      {getEventIcon(event.event_type, event.success)}
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white">
                          {formatEventTitle(event.event_type)}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="bg-slate-700/50 px-2 py-1 rounded">
                            {event.source_table === 'security_events' ? 'Security' : 'Audit'}
                          </span>
                          <Clock className="w-3 h-3" />
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-300 mb-2">
                        {formatEventDetails(event)}
                      </div>
                      
                      {event.details?.reason && (
                        <div className="text-xs text-slate-400 bg-slate-700/30 rounded px-2 py-1 inline-block">
                          {event.details.reason}
                        </div>
                      )}
                    </div>
                    
                    {/* Risk indicator */}
                    {event.risk_score !== undefined && event.risk_score > 0 && (
                      <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${
                        event.risk_score >= 70 ? 'bg-red-900/30 text-red-300' :
                        event.risk_score >= 30 ? 'bg-yellow-900/30 text-yellow-300' :
                        'bg-green-900/30 text-green-300'
                      }`}>
                        Risk: {event.risk_score}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-700/50 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Showing {(currentPage - 1) * eventsPerPage + 1} to{' '}
                  {Math.min(currentPage * eventsPerPage, filteredEvents.length)} of{' '}
                  {filteredEvents.length} events
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-slate-300 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-1 text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-slate-300 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                {getEventIcon(selectedEvent.event_type, selectedEvent.success)}
                {formatEventTitle(selectedEvent.event_type)}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Timestamp:</span>
                  <div className="text-white font-mono">
                    {new Date(selectedEvent.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <span className="text-slate-400">Success:</span>
                  <div className={`font-medium ${selectedEvent.success ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedEvent.success ? 'Yes' : 'No'}
                  </div>
                </div>
                
                {selectedEvent.ip_address && (
                  <div>
                    <span className="text-slate-400">IP Address:</span>
                    <div className="text-white font-mono">{selectedEvent.ip_address}</div>
                  </div>
                )}
                
                {selectedEvent.risk_score !== undefined && selectedEvent.risk_score > 0 && (
                  <div>
                    <span className="text-slate-400">Risk Score:</span>
                    <div className={`font-medium ${
                      selectedEvent.risk_score >= 70 ? 'text-red-400' :
                      selectedEvent.risk_score >= 30 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {selectedEvent.risk_score}
                    </div>
                  </div>
                )}
                
                {selectedEvent.location_city && (
                  <div className="col-span-2">
                    <span className="text-slate-400">Location:</span>
                    <div className="text-white">
                      {selectedEvent.location_city}, {selectedEvent.location_country}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedEvent.user_agent && (
                <div>
                  <span className="text-slate-400 text-sm">User Agent:</span>
                  <div className="text-white text-sm font-mono bg-slate-700/50 p-2 rounded mt-1">
                    {selectedEvent.user_agent}
                  </div>
                </div>
              )}
              
              {Object.keys(selectedEvent.details || {}).length > 0 && (
                <div>
                  <span className="text-slate-400 text-sm">Event Details:</span>
                  <pre className="text-white text-xs bg-slate-700/50 p-3 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityTimeline;