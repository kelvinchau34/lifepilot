import React from 'react';
import { Brain, Calendar, DollarSign, Heart, BookOpen } from 'lucide-react';
import { Agent } from '../../../../utils/types';

interface NavigationProps {
  agents: Agent[];
  activeAgent: string;
  onAgentChange: (agentId: string) => void;
}

const ICON_MAP = {
  Brain,
  Calendar,
  DollarSign,
  Heart,
  BookOpen
};

export const Navigation: React.FC<NavigationProps> = ({
  agents,
  activeAgent,
  onAgentChange
}) => {
  return (
    <nav className="p-4">
      <div className="space-y-2">
        {agents.map((agent) => {
          const IconComponent = ICON_MAP[agent.icon as keyof typeof ICON_MAP];
          return (
            <button
              key={agent.id}
              onClick={() => onAgentChange(agent.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeAgent === agent.id
                  ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeAgent === agent.id 
                  ? agent.color 
                  : 'bg-gray-100'
              }`}>
                <IconComponent className={`w-4 h-4 ${
                  activeAgent === agent.id ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};