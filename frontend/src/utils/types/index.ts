export interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Subscription {
  status: 'active' | 'canceled' | 'expired' | 'trial';
  plan: string;
  expiresAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscription: Subscription;
}

export interface AppState {
  activeAgent: string;
  user: User | null;
  isLoading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}