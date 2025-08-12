import React from 'react';

interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscription: {
    status: 'active' | 'canceled' | 'expired' | 'trial';
    plan: string;
    expiresAt: string;
  };
}

interface HeaderProps {
  currentAgent: Agent;
  user: User;
}

export const Header: React.FC<HeaderProps> = ({ currentAgent, user }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{currentAgent.icon}</span>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{currentAgent.name}</h1>
            <p className="text-sm text-gray-500">{currentAgent.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.subscription.plan} plan</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};