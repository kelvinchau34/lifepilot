import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const [hasNotifications] = useState(true);

  return (
    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
      <Bell className="w-5 h-5" />
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
      )}
    </button>
  );
};