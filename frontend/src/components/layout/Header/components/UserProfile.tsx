import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { User } from '../../../../utils/types';

interface UserProfileProps {
  user: User | null;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
        <div className="bg-gray-300 p-2 rounded-full">
          <UserIcon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-800">Guest</div>
          <div className="text-gray-500">Not logged in</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-5 h-5 rounded-full"
          />
        ) : (
          <UserIcon className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-800">{user.name}</div>
        <div className="text-gray-500 capitalize">{user.subscription.status} User</div>
      </div>
    </div>
  );
};