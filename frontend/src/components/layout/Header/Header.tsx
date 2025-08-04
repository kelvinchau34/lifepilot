import React from 'react';
import { Settings } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { NotificationBell } from './components/NotificationBell';
import { UserProfile } from './components/UserProfile';
import { Agent, User } from '../../../utils/types';

interface HeaderProps {
  currentAgent: Agent | undefined;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ currentAgent, user }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {currentAgent?.name || 'Dashboard'}
          </h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            AI Powered
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <SearchBar />
          <NotificationBell />
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <UserProfile user={user} />
        </div>
      </div>
    </header>
  );
};