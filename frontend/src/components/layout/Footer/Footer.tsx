import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">© 2025 LifePilot. All rights reserved.</p>
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ● Online
          </span>
        </div>
      </div>
    </footer>
  );
};