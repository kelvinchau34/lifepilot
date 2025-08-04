import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';

export const StatusFooter: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-3 text-sm text-gray-600">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>System Status: Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Last sync: 2 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};