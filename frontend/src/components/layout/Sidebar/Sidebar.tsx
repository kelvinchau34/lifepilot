import React from 'react';

interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
}

interface SidebarProps {
  agents: Agent[];
  activeAgent: string;
  onAgentChange: (agentId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ agents, activeAgent, onAgentChange }) => {
  return (
    <div className="bg-white w-64 shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">LifePilot</h1>
      </div>
      
      <nav className="mt-8">
        <div className="px-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Agents</h2>
          <div className="mt-2 space-y-1">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => onAgentChange(agent.id)}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  activeAgent === agent.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{agent.icon}</span>
                {agent.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-8 px-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</h2>
          <div className="mt-2 space-y-1">
            <a href="/" className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
              🏠 Dashboard
            </a>
            <a href="/health" className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
              🏥 Health
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};