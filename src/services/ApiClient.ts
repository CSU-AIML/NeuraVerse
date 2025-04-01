// src/services/ApiClient.ts

import { TokenService } from './TokenService';
import { supabase } from '../lib/supabase';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  requiredPermission?: string;
}

export class ApiClient {
  static async request<T = any>(
    url: string, 
    options: ApiOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
      requiredPermission
    } = options;
    
    // Refresh token if needed when auth is required
    if (requiresAuth) {
      const tokenValid = await TokenService.refreshIfNeeded();
      if (!tokenValid) {
        throw new Error('Authentication required');
      }
      
      // Check permission if specified
      if (requiredPermission) {
        const hasPermission = await TokenService.checkPermission(requiredPermission);
        if (!hasPermission) {
          throw new Error(`Permission denied: ${requiredPermission} required`);
        }
      }
      
      // Get session for the auth token
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        throw new Error('No active session');
      }
      
      // Add auth header
      headers['Authorization'] = `Bearer ${data.session.access_token}`;
    }
    
    // Add default headers
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    
    // Prepare request
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include'
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse JSON response
    try {
      return await response.json();
    } catch (e) {
      // Return empty object for non-JSON responses
      return {} as T;
    }
  }
  
  // Convenience methods
  static async get<T = any>(
    url: string, 
    options: Omit<ApiOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }
  
  static async post<T = any>(
    url: string, 
    body: any,
    options: Omit<ApiOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }
  
  static async put<T = any>(
    url: string, 
    body: any,
    options: Omit<ApiOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }
  
  static async delete<T = any>(
    url: string, 
    options: Omit<ApiOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}