// server/websocket-server.js

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Create Supabase admin client for token verification
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const wss = new WebSocket.Server({ port: 3001 });

// Track active connections
const connections = new Map();

// Validate JWT token from Supabase
async function validateToken(token) {
  try {
    // Verify with Supabase admin client
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      return { valid: false, error: error?.message || 'Invalid token' };
    }
    
    // Check if user is blocked in the database
    const { data: blockData, error: blockError } = await supabaseAdmin
      .from('security_events')
      .select('*')
      .eq('user_id', data.user.id)
      .eq('event_type', 'account_blocked')
      .limit(1);
      
    if (blockError) {
      console.error('Error checking block status:', blockError);
    } else if (blockData && blockData.length > 0) {
      return { valid: false, error: 'Account is blocked' };
    }
    
    // Log validation event
    await supabaseAdmin
      .from('security_events')
      .insert({
        event_type: 'websocket_auth',
        user_id: data.user.id,
        details: {
          timestamp: Date.now()
        }
      });
    
    return { 
      valid: true, 
      user: data.user
    };
  } catch (err) {
    console.error('Token validation error:', err);
    return { valid: false, error: 'Server error validating token' };
  }
}

// Check if user has permission
async function checkPermission(userId, permission) {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      'check_permission',
      { 
        user_id_param: userId,
        permission_name: permission
      }
    );
    
    if (error) {
      console.error('Permission check error:', error);
      return false;
    }
    
    return data === true;
  } catch (err) {
    console.error('Permission check error:', err);
    return false;
  }
}

wss.on('connection', async function connection(ws, req) {
  // Parse URL params
  const url = new URL(req.url, `http://${req.headers.host}`);
  const projectId = url.searchParams.get('projectId');
  const token = url.searchParams.get('token');
  
  // Validate token
  const validation = await validateToken(token);
  
  if (!validation.valid) {
    // Send auth error and close connection
    ws.send(JSON.stringify({
      type: 'auth_error',
      message: validation.error
    }));
    
    // Close with custom code 4001 for auth failure
    return ws.close(4001, 'Authentication failed');
  }
  
  // Get user data
  const userId = validation.user.id;
  const userRole = validation.user.user_metadata?.role || 'user';
  
  // Check project access permission
  const canAccessProject = await checkPermission(userId, 'general');
  if (!canAccessProject) {
    ws.send(JSON.stringify({
      type: 'auth_error',
      message: 'No permission to access this project'
    }));
    return ws.close(4003, 'Permission denied');
  }
  
  // Store user info with connection
  ws.userId = userId;
  ws.userRole = userRole;
  ws.projectId = projectId;
  ws.connectedAt = Date.now();
  
  // Add to connections map
  if (!connections.has(projectId)) {
    connections.set(projectId, new Map());
  }
  connections.get(projectId).set(userId, ws);
  
  // Log successful connection
  console.log(`User ${userId} connected to project ${projectId}`);
  
  // Handle ping/heartbeat
  let heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);
  
  // Handle messages
  ws.on('message', async function incoming(message) {
    try {
      const data = JSON.parse(message);
      
      // Respond to ping with pong
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        return;
      }
      
      // Handle client disconnect message
      if (data.type === 'client-disconnect') {
        console.log(`User ${userId} disconnected from project ${projectId}`);
        ws.close(1000, 'Client requested disconnect');
        return;
      }
      
      // Check timestamp to prevent replay attacks (within 5 minutes)
      const messageTime = data.timestamp || 0;
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (Math.abs(now - messageTime) > fiveMinutes) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Message timestamp is too old or invalid'
        }));
        return;
      }
      
      // Handle project execution commands with permission checks
      if (
        data.type === 'start-backend' || 
        data.type === 'start-frontend' || 
        data.type === 'stop-project'
      ) {
        // Check if user has permission to manage projects
        const canManageProjects = await checkPermission(userId, 'manage_projects');
        
        if (!canManageProjects) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Permission denied: Cannot execute project commands'
          }));
          return;
        }
        
        // Process command...
      }
      
      // Process other message types...
      
    } catch (err) {
      console.error('Error processing message:', err);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  // Handle connection close
  ws.on('close', function () {
    clearInterval(heartbeatInterval);
    
    // Remove from connections map
    if (connections.has(projectId)) {
      connections.get(projectId).delete(userId);
      
      if (connections.get(projectId).size === 0) {
        connections.delete(projectId);
      }
    }
    
    console.log(`User ${userId} disconnected from project ${projectId}`);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'status',
    projectId,
    backend: 'stopped',
    frontend: 'stopped'
  }));
});