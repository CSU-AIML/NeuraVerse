// components/admin/SecurityDashboard.tsx - Real-time Security Monitoring
import { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Activity, 
  Lock,
  Eye,
  Clock,
  MapPin,
  Zap,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string;
  ip_address: string;
  location_country?: string;
  location_city?: string;
  risk_score: number;
  details: any;
  success: boolean;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface SecurityMetrics {
  totalEvents: number;
  highRiskEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
  activeUsers: number;
  newThreats: number;
  blockedAttempts: number;
  averageRiskScore: number;
}

interface ThreatPattern {
  id: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurrences: number;
  lastSeen: string;
  description: string;
}

const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;
  const [isLoading, setIsLoading] = useState(true);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    highRiskEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    activeUsers: 0,
    newThreats: 0,
    blockedAttempts: 0,
    averageRiskScore: 0
  });
  
  const [threatPatterns, setThreatPatterns] = useState<ThreatPattern[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check admin permission
  useEffect(() => {
    if (role !== 'admin') {
      return;
    }
    loadSecurityData();
    
    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadSecurityData();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [role, selectedTimeRange, autoRefresh]);

  const loadSecurityData = async () => {
    if (role !== 'admin') return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        loadSecurityEvents(),
        loadSecurityMetrics(),
        loadThreatPatterns()
      ]);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      const timeRanges = {
        '1h': 1,
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      };
      
      const hoursAgo = timeRanges[selectedTimeRange];
      const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select(`
          *,
          user_profiles!left(email, display_name)
        `)
        .gte('created_at', startTime)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      const eventsWithUserInfo = (data || []).map(event => ({
        ...event,
        user_email: event.user_profiles?.email,
        user_name: event.user_profiles?.display_name
      }));
      
      setSecurityEvents(eventsWithUserInfo);
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const loadSecurityMetrics = async () => {
    try {
      const timeRanges = {
        '1h': 1,
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      };
      
      const hoursAgo = timeRanges[selectedTimeRange];
      const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
      
      // Get various metrics
      const [
        { data: totalEvents },
        { data: highRiskEvents },
        { data: failedLogins },
        { data: suspiciousActivity },
        { data: activeUsers },
        { data: blockedAttempts }
      ] = await Promise.all([
        supabase
          .from('security_events')
          .select('id')
          .gte('created_at', startTime),
        supabase
          .from('security_events')
          .select('id')
          .gte('created_at', startTime)
          .gte('risk_score', 70),
        supabase
          .from('security_events')
          .select('id')
          .eq('event_type', 'login_failed')
          .gte('created_at', startTime),
        supabase
          .from('security_events')
          .select('id')
          .eq('event_type', 'suspicious_activity')
          .gte('created_at', startTime),
        supabase
          .from('user_profiles')
          .select('id')
          .eq('account_status', 'active'),
        supabase
          .from('security_events')
          .select('id')
          .eq('event_type', 'permission_denied')
          .gte('created_at', startTime)
      ]);
      
      // Calculate average risk score
      const { data: riskScores } = await supabase
        .from('security_events')
        .select('risk_score')
        .gte('created_at', startTime)
        .not('risk_score', 'is', null);
      
      const avgRiskScore = riskScores && riskScores.length > 0 
        ? riskScores.reduce((sum, event) => sum + (event.risk_score || 0), 0) / riskScores.length
        : 0;
      
      setMetrics({
        totalEvents: totalEvents?.length || 0,
        highRiskEvents: highRiskEvents?.length || 0,
        failedLogins: failedLogins?.length || 0,
        suspiciousActivity: suspiciousActivity?.length || 0,
        activeUsers: activeUsers?.length || 0,
        newThreats: highRiskEvents?.length || 0,
        blockedAttempts: blockedAttempts?.length || 0,
        averageRiskScore: Math.round(avgRiskScore)
      });
    } catch (error) {
      console.error('Error loading security metrics:', error);
    }
  };

  const loadThreatPatterns = async () => {
    try {
      // Analyze common threat patterns
      const { data: events } = await supabase
        .from('security_events')
        .select('event_type, risk_score, ip_address, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .gte('risk_score', 50);
      
      if (!events) return;
      
      // Group by event type and analyze patterns
      const patternMap = new Map();
      
      events.forEach(event => {
        const key = event.event_type;
        if (!patternMap.has(key)) {
          patternMap.set(key, {
            pattern: key,
            occurrences: 0,
            maxRisk: 0,
            ips: new Set(),
            lastSeen: event.created_at
          });
        }
        
        const pattern = patternMap.get(key);
        pattern.occurrences++;
        pattern.maxRisk = Math.max(pattern.maxRisk, event.risk_score);
        pattern.ips.add(event.ip_address);
        if (event.created_at > pattern.lastSeen) {
          pattern.lastSeen = event.created_at;
        }
      });
      
      // Convert to threat patterns
      const patterns: ThreatPattern[] = Array.from(patternMap.values()).map((pattern, index) => ({
        id: `pattern-${index}`,
        pattern: pattern.pattern,
        severity: pattern.maxRisk >= 90 ? 'critical' : 
                 pattern.maxRisk >= 70 ? 'high' :
                 pattern.maxRisk >= 50 ? 'medium' : 'low',
        occurrences: pattern.occurrences,
        lastSeen: pattern.lastSeen,
        description: getPatternDescription(pattern.pattern, pattern.occurrences, pattern.ips.size)
      }));
      
      setThreatPatterns(patterns.sort((a, b) => b.occurrences - a.occurrences));
    } catch (error) {
      console.error('Error loading threat patterns:', error);
    }
  };

  const getPatternDescription = (pattern: string, occurrences: number, uniqueIps: number): string => {
    const descriptions: Record<string, string> = {
      'login_failed': `${occurrences} failed login attempts from ${uniqueIps} unique IP addresses`,
      'suspicious_activity': `${occurrences} suspicious activities detected from ${uniqueIps} sources`,
      'permission_denied': `${occurrences} unauthorized access attempts from ${uniqueIps} locations`,
      'device_change': `${occurrences} device changes detected from ${uniqueIps} new devices`,
      'token_refresh': `${occurrences} unusual token refresh patterns from ${uniqueIps} sources`
    };
    
    return descriptions[pattern] || `${occurrences} occurrences of ${pattern} from ${uniqueIps} sources`;
  };

  const filteredEvents = useMemo(() => {
    return securityEvents.filter(event => {
      const matchesEventType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
      const matchesRisk = riskFilter === 'all' || 
        (riskFilter === 'high' && event.risk_score >= 70) ||
        (riskFilter === 'medium' && event.risk_score >= 30 && event.risk_score < 70) ||
        (riskFilter === 'low' && event.risk_score < 30);
      
      const matchesSearch = !searchQuery || 
        event.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.ip_address?.includes(searchQuery) ||
        event.event_type.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesEventType && matchesRisk && matchesSearch;
    });
  }, [securityEvents, eventTypeFilter, riskFilter, searchQuery]);

  const getEventTypeColor = (eventType: string): string => {
    const colorMap: Record<string, string> = {
      'login_success': 'text-green-400 bg-green-900/30',
      'login_failed': 'text-red-400 bg-red-900/30',
      'suspicious_activity': 'text-orange-400 bg-orange-900/30',
      'permission_denied': 'text-red-400 bg-red-900/30',
      'device_change': 'text-yellow-400 bg-yellow-900/30',
      'account_locked': 'text-red-500 bg-red-900/40'
    };
    
    return colorMap[eventType] || 'text-gray-400 bg-gray-900/30';
  };

  const getRiskLevelColor = (riskScore: number): string => {
    if (riskScore >= 90) return 'text-red-500 bg-red-900/30';
    if (riskScore >= 70) return 'text-orange-500 bg-orange-900/30';
    if (riskScore >= 30) return 'text-yellow-500 bg-yellow-900/30';
    return 'text-green-500 bg-green-900/30';
  };

  const getSeverityColor = (severity: string): string => {
    const colors = {
      'critical': 'text-red-500 bg-red-900/30 border-red-600',
      'high': 'text-orange-500 bg-orange-900/30 border-orange-600',
      'medium': 'text-yellow-500 bg-yellow-900/30 border-yellow-600',
      'low': 'text-blue-500 bg-blue-900/30 border-blue-600'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const exportSecurityReport = async () => {
    try {
      const report = {
        generated_at: new Date().toISOString(),
        time_range: selectedTimeRange,
        metrics,
        threat_patterns: threatPatterns,
        recent_events: filteredEvents.slice(0, 50),
        summary: {
          total_events: metrics.totalEvents,
          risk_assessment: metrics.averageRiskScore >= 70 ? 'High Risk' : 
                          metrics.averageRiskScore >= 30 ? 'Medium Risk' : 'Low Risk',
          recommendations: generateSecurityRecommendations()
        }
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting security report:', error);
    }
  };

  const generateSecurityRecommendations = (): string[] => {
    const recommendations = [];
    
    if (metrics.failedLogins > 10) {
      recommendations.push('Consider implementing additional rate limiting for login attempts');
    }
    
    if (metrics.highRiskEvents > 5) {
      recommendations.push('Review high-risk events and consider blocking suspicious IP addresses');
    }
    
    if (metrics.averageRiskScore > 50) {
      recommendations.push('Enable additional security monitoring and alerts');
    }
    
    if (threatPatterns.some(p => p.severity === 'critical')) {
      recommendations.push('Immediate investigation required for critical threat patterns');
    }
    
    return recommendations.length > 0 ? recommendations : ['No immediate security concerns detected'];
  };

  // Redirect if not admin
  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950/20 to-orange-950/20 flex items-center justify-center p-6">
        <div className="text-center bg-red-900/20 border border-red-800 rounded-2xl p-8">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-100 mb-2">Access Denied</h1>
          <p className="text-red-300">Security Dashboard requires administrator privileges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-400" />
                Security Dashboard
              </h1>
              <p className="text-slate-400 mt-2">
                Real-time security monitoring and threat detection
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-400">Auto-refresh:</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    autoRefresh 
                      ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                      : 'bg-slate-600/20 text-slate-300 border border-slate-500/30'
                  }`}
                >
                  {autoRefresh ? 'ON' : 'OFF'}
                </button>
              </div>
              
              <button
                onClick={loadSecurityData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-300 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={exportSecurityReport}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-300 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Time Range:</span>
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  selectedTimeRange === range
                    ? 'bg-red-600/30 text-red-300 border border-red-500/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
                }`}
              >
                {range === '1h' ? 'Last Hour' : 
                 range === '24h' ? 'Last 24 Hours' :
                 range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Events</p>
                <p className="text-3xl font-bold text-slate-100">{metrics.totalEvents}</p>
                <p className="text-xs text-slate-500 mt-1">Security events tracked</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">High Risk Events</p>
                <p className="text-3xl font-bold text-red-400">{metrics.highRiskEvents}</p>
                <p className="text-xs text-slate-500 mt-1">Risk score ≥ 70</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Failed Logins</p>
                <p className="text-3xl font-bold text-orange-400">{metrics.failedLogins}</p>
                <p className="text-xs text-slate-500 mt-1">Authentication failures</p>
              </div>
              <Lock className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Avg Risk Score</p>
                <p className={`text-3xl font-bold ${getRiskLevelColor(metrics.averageRiskScore).split(' ')[0]}`}>
                  {metrics.averageRiskScore}
                </p>
                <p className="text-xs text-slate-500 mt-1">Current threat level</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Threat Patterns */}
        {threatPatterns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Active Threat Patterns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {threatPatterns.slice(0, 6).map((pattern) => (
                <div
                  key={pattern.id}
                  className={`p-4 rounded-xl border ${getSeverityColor(pattern.severity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">
                      {pattern.pattern.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                      {pattern.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{pattern.description}</p>
                  <div className="text-xs text-slate-400">
                    Last seen: {new Date(pattern.lastSeen).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Events */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Security Events
              </h2>
              <div className="text-sm text-slate-400">
                Showing {filteredEvents.length} of {securityEvents.length} events
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-sm"
                />
              </div>
              
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm"
              >
                <option value="all">All Event Types</option>
                <option value="login_success">Login Success</option>
                <option value="login_failed">Login Failed</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="permission_denied">Permission Denied</option>
                <option value="device_change">Device Change</option>
              </select>
              
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk (70+)</option>
                <option value="medium">Medium Risk (30-69)</option>
                <option value="low">Low Risk (0-29)</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Loading security events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No security events found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.slice(0, 20).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg hover:bg-slate-700/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type.replace(/_/g, ' ')}
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-white">
                          {event.user_name || event.user_email || 'Unknown User'}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {event.ip_address}
                          {event.location_city && (
                            <span>• {event.location_city}, {event.location_country}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(event.risk_score)}`}>
                        Risk: {event.risk_score}
                      </div>
                      
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                      
                      <div className={`w-2 h-2 rounded-full ${event.success ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;