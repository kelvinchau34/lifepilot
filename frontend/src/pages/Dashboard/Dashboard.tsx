import React from 'react';
import { Header, Sidebar, Footer } from '../../components/layout';
import { ComingSoon } from '../../components/agents/common';
import { useAgentState } from '../../hooks';
import { User } from '../../utils/types';

// Mock user data - in a real app, this would come from authentication
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  subscription: 'premium',
  avatar: undefined // You can add an avatar URL here if you want
};

export const Dashboard: React.FC = () => {
  const { 
    agents, 
    activeAgent, 
    switchAgent, 
    getCurrentAgent,
    activeAgentsCount,
    totalAgentsCount 
  } = useAgentState();

  const currentAgent = getCurrentAgent();

  // In the future, this function will route to specific agent components
  // For now, we show the Coming Soon component for all agents
  const renderAgentContent = () => {
    if (!currentAgent) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Agent Selected</h2>
            <p className="text-gray-600">Please select an agent from the sidebar.</p>
          </div>
        </div>
      );
    }

    // This is where you'll later add routing to specific agent components:
    // switch (currentAgent.id) {
    //   case 'executive':
    //     return <ExecutiveAgent />;
    //   case 'calendar':
    //     return <CalendarAgent />;
    //   case 'finance':
    //     return <FinanceAgent />;
    //   case 'health':
    //     return <HealthAgent />;
    //   case 'knowledge':
    //     return <KnowledgeAgent />;
    //   default:
    //     return <ComingSoon agent={currentAgent} />;
    // }

    // For now, show Coming Soon for all agents
    return <ComingSoon agent={currentAgent} />;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        agents={agents}
        activeAgent={activeAgent}
        onAgentChange={switchAgent}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header 
          currentAgent={currentAgent}
          user={mockUser}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200">
            {renderAgentContent()}
          </div>
        </main>
        
        {/* Bottom Footer */}
        <Footer />
      </div>

      {/* Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-50">
          <div>Active: {activeAgent}</div>
          <div>Agents: {activeAgentsCount}/{totalAgentsCount}</div>
          <div>User: {mockUser.name}</div>
        </div>
      )}
    </div>
  );
};