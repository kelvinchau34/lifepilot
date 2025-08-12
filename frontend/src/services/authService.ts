import { apiClient } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription: {
    type: string;
    status: string;
    expiresAt?: string;
  };
  preferences: {
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    timezone: string;
  };
  agentSettings: Record<string, any>;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const result = await apiClient.post('/api/auth/login', credentials);
      
      if (result.success && result.data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
      
      return result;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const result = await apiClient.post('/api/auth/register', userData);
      
      if (result.success && result.data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
      
      return result;
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const result = await apiClient.get('/api/auth/me');
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get user');
      }
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      return result.data.user;
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get user');
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Get stored user data
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const result = await apiClient.put('/api/users/profile', updates);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      return result.data.user;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  },

  // Create demo user for testing
  getDemoUser(): User {
    return {
      _id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@lifepilot.com',
      avatar: 'https://via.placeholder.com/40',
      subscription: {
        type: 'free',
        status: 'active',
      },
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        timezone: 'UTC',
      },
      agentSettings: {
        health: { enabled: true },
        executive: { enabled: true },
        calendar: { enabled: true },
        finance: { enabled: true },
        knowledge: { enabled: true },
      },
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};