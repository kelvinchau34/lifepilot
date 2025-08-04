import React from 'react';
import { Brain } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">LifePilot</h1>
          <p className="text-sm text-gray-500">AI Assistant</p>
        </div>
      </div>
    </div>
  );
};