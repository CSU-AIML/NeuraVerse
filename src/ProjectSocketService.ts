// ProjectSocketService.ts
// This service manages WebSocket connections to the project runner backend with enhanced security

import { supabase } from './lib/supabase';

export interface ProjectStatusUpdate {
  projectId: string;
  backend: 'running' | 'stopped';
  frontend: 'running' | 'stopped';
  backendPort?: number;
  frontendPort?: number;
  exitCode?: number;
}

export interface ProjectLogMessage {
  projectId: string;
  target: 'backend' | 'frontend';
  message: string;
}

export interface ProjectErrorMessage {
  projectId: string;
  target: 'backend' | 'frontend';
  message: string;
}

export interface ProjectPortInfo {
  projectId: string;
  target: 'backend' | 'frontend';
  port: number;
}

type MessageListener = (type: string, data: any) => void;

class ProjectSocketService {
  private socket: WebSocket | null = null;
  private projectId: string | null = null;
  private listeners: Map<string, Set<MessageListener>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private MAX_RECONNECT_ATTEMPTS = 5;
  private RECONNECT_DELAY = 2000; // 2 seconds
  
  // Security enhancements
  private authToken: string | null = null;
  private lastTokenRefresh: number = 0;
  private TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private socketHeartbeatTimer: NodeJS.Timeout | null = null;
  private HEARTBEAT_INTERVAL = 30000; // 30 seconds
  
  constructor() {
    // Setup token refresh interval
    setInterval(() => this.refreshAuthToken(), this.TOKEN_REFRESH_INTERVAL);
  }
  
  // Refresh the authentication token
  private async refreshAuthToken(): Promise<boolean> {
    try {
      // Only refresh if enough time has passed
      const now = Date.now();
      if (now - this.lastTokenRefresh < this.TOKEN_REFRESH_INTERVAL / 2) {
        return this.authToken !== null;
      }
      
      // Get current session
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        console.error('Failed to get auth session:', error);
        this.authToken = null;
        return false;
      }
      
      this.authToken = data.session.access_token;
      this.lastTokenRefresh = now;
      
      return true;
    } catch (err) {
      console.error('Error refreshing auth token:', err);
      this.authToken = null;
      return false;
    }
  }
  
  // Get the WebSocket URL from environment with auth token
  private async getWebSocketUrl(): Promise<string | null> {
    // Ensure we have a valid auth token
    const hasValidToken = await this.refreshAuthToken();
    if (!hasValidToken) {
      console.error('Cannot establish WebSocket connection without valid auth token');
      return null;
    }
    
    // Use the environment variable if available, or default to localhost:3001
    const wsHost = import.meta.env.VITE_PROJECT_RUNNER_WS_URL || 'ws://localhost:3001';
    return `${wsHost}?projectId=${this.projectId}&token=${encodeURIComponent(this.authToken!)}`;
  }
  
  // Connect to the project runner service
  public async connect(projectId: string): Promise<boolean> {
    // Close existing connection if any
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    
    this.projectId = projectId;
    this.reconnectAttempts = 0;
    
    return await this.createConnection();
  }
  
  // Create a new WebSocket connection with security enhancements
  private async createConnection(): Promise<boolean> {
    try {
      const wsUrl = await this.getWebSocketUrl();
      if (!wsUrl) {
        return false;
      }
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log(`Connected to project ${this.projectId}`);
        this.reconnectAttempts = 0;
        this.dispatchEvent('connect', { projectId: this.projectId });
        
        // Start heartbeat to keep connection alive and detect stale connections
        this.startHeartbeat();
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle heartbeat response
          if (data.type === 'pong') {
            // Connection is alive, nothing to do
            return;
          }
          
          // Handle token expiration messages
          if (data.type === 'auth_error') {
            console.error('Authentication error:', data.message);
            this.refreshAuthToken().then(success => {
              if (success) {
                this.reconnect();
              } else {
                this.dispatchEvent('auth_error', { error: data.message });
              }
            });
            return;
          }
          
          this.handleMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      this.socket.onclose = (event) => {
        this.stopHeartbeat();
        
        console.log(`Disconnected from project ${this.projectId}. Code: ${event.code}, Reason: ${event.reason}`);
        this.dispatchEvent('disconnect', { 
          projectId: this.projectId, 
          code: event.code,
          reason: event.reason
        });
        
        // Check if closed due to auth error (custom code 4001)
        if (event.code === 4001) {
          this.refreshAuthToken().then(success => {
            if (success) {
              this.attemptReconnect();
            }
          });
        } else if (event.code !== 1000) {
          // 1000 is normal closure, don't reconnect in that case
          this.attemptReconnect();
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.dispatchEvent('error', { error, projectId: this.projectId });
      };
      
      // Wait for connection to establish or fail
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            resolve(false);
          }
        }, 5000);
        
        if (this.socket) { // Fix: Add null check
          this.socket.addEventListener('open', () => {
            clearTimeout(timeout);
            resolve(true);
          });
          
          this.socket.addEventListener('error', () => {
            clearTimeout(timeout);
            resolve(false);
          });
        } else {
          clearTimeout(timeout);
          resolve(false);
        }
      });
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      this.attemptReconnect();
      return false;
    }
  }
  
  // Implement heartbeat to detect stale connections
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.socketHeartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.sendMessage('ping');
      } else {
        this.stopHeartbeat();
      }
    }, this.HEARTBEAT_INTERVAL);
  }
  
  private stopHeartbeat(): void {
    if (this.socketHeartbeatTimer) {
      clearInterval(this.socketHeartbeatTimer);
      this.socketHeartbeatTimer = null;
    }
  }
  
  // Force reconnect with fresh token
  private async reconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    await this.createConnection();
  }
  
  // Attempt to reconnect with exponential backoff
  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error(`Failed to reconnect after ${this.MAX_RECONNECT_ATTEMPTS} attempts`);
      this.dispatchEvent('reconnect-failed', { projectId: this.projectId });
      return;
    }
    
    const delay = this.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(async () => {
      await this.createConnection();
    }, delay);
  }
  
  // Handle incoming messages
  private handleMessage(data: any): void {
    const { type } = data;
    
    switch (type) {
      case 'status':
        this.dispatchEvent('status', data as ProjectStatusUpdate);
        break;
      case 'log':
        this.dispatchEvent('log', data as ProjectLogMessage);
        break;
      case 'error':
        this.dispatchEvent('error', data as ProjectErrorMessage);
        break;
      case 'port':
        this.dispatchEvent('port', data as ProjectPortInfo);
        break;
      case 'token_expired':
        // Handle token expiration
        this.refreshAuthToken().then(success => {
          if (success) {
            this.reconnect();
          }
        });
        break;
      default:
        console.warn('Unknown message type:', type, data);
    }
  }
  
  // Send a message to the project runner service with added security
  public sendMessage(type: string, data: any = {}): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, socket not connected');
      return;
    }
    
    // Add timestamp to prevent replay attacks
    const message = JSON.stringify({
      type,
      projectId: this.projectId,
      timestamp: Date.now(),
      ...data
    });
    
    this.socket.send(message);
  }
  
  // Securely start the backend process
  public async startBackend(githubToken: string, command?: string): Promise<void> {
    // Ensure we have a valid session first
    const hasValidToken = await this.refreshAuthToken();
    if (!hasValidToken) {
      this.dispatchEvent('auth_error', { 
        error: 'Authentication required to start backend',
        projectId: this.projectId
      });
      return;
    }
    
    // Send the command with the refreshed token
    this.sendMessage('start-backend', { 
      githubToken, 
      command,
      auth: {
        token: this.authToken,
        timestamp: Date.now()
      }
    });
  }
  
  // Securely start the frontend process
  public async startFrontend(command?: string): Promise<void> {
    // Ensure we have a valid session first
    const hasValidToken = await this.refreshAuthToken();
    if (!hasValidToken) {
      this.dispatchEvent('auth_error', { 
        error: 'Authentication required to start frontend',
        projectId: this.projectId
      });
      return;
    }
    
    this.sendMessage('start-frontend', { 
      command,
      auth: {
        token: this.authToken,
        timestamp: Date.now()
      }
    });
  }
  
  // Securely stop the backend process
  public stopBackend(): void {
    this.sendMessage('stop-backend');
  }
  
  // Securely stop the frontend process
  public stopFrontend(): void {
    this.sendMessage('stop-frontend');
  }
  
  // Securely stop the entire project
  public stopProject(): void {
    this.sendMessage('stop-project');
  }
  
  // Disconnect from the project runner service
  public disconnect(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      // Send a clean disconnect message
      try {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.sendMessage('client-disconnect');
        }
      } catch (err) {
        console.warn('Error sending disconnect message:', err);
      }
      
      this.socket.close();
      this.socket = null;
    }
    
    this.projectId = null;
    this.authToken = null;
  }
  
  // Add event listener
  public addEventListener(type: string, listener: MessageListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(listener);
  }
  
  // Remove event listener
  public removeEventListener(type: string, listener: MessageListener): void {
    if (this.listeners.has(type)) {
      this.listeners.get(type)!.delete(listener);
    }
  }
  
  // Dispatch event to listeners
  private dispatchEvent(type: string, data: any): void {
    if (this.listeners.has(type)) {
      for (const listener of this.listeners.get(type)!) {
        try {
          listener(type, data);
        } catch (err) {
          console.error('Error in event listener:', err);
        }
      }
    }
  }
}

// Export a singleton instance
export const projectSocketService = new ProjectSocketService();