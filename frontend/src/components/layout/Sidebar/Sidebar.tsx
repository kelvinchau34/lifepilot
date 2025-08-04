import React from 'react';
import { Logo } from './components/Logo';
import { Navigation } from './components/Navigation';
import { StatusFooter } from './components/StatusFooter';
import { Agent } from '../../../utils/types';


interface SidebarProps {
  agents: Agent[];
  activeAgent: string;
  onAgentChange: (agentId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  agents,
  activeAgent,
  onAgentChange
}) => {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <Logo />
      <div className="flex-1">
        <Navigation 
          agents={agents}
          activeAgent={activeAgent}
          onAgentChange={onAgentChange}
        />
      </div>
      <StatusFooter />
    </div>
  );
};