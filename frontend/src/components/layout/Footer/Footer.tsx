import React from 'react';
import { Target, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>AI Agents Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>5 Active Modules</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>System Healthy</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span>LifePilot v1.0.0</span>
          <span>•</span>
          <span>Built with React & AI</span>
        </div>
      </div>
    </footer>
  );
};