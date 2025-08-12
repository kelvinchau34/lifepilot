import React, { useState } from 'react';
import { Header, Sidebar, Footer } from '../../components/layout';
import { ComingSoon } from '../../components/agents/common';
import { useAgentState } from '../../hooks';

// Define types locally if needed
interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscription: {
    status: 'active' | 'canceled' | 'expired' | 'trial';
    plan: string;
    expiresAt: string;
  };
}

// Mock agent data
const mockAgents: Agent[] = [
  { 
    id: 'health', 
    name: 'Health Assistant', 
    icon: '🏥', 
    color: 'bg-green-500',
    description: 'Manage your health documents',
    status: 'active'
  }
];

// Mock user data - in a real app, this would come from authentication
const mockUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: 'https://via.placeholder.com/40',
  subscription: {
    status: 'active',
    plan: 'free',
    expiresAt: new Date().toISOString()
  }
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

  const [selectedAgent] = useState(mockAgents[0]);
  
  // Provide a fallback to ensure currentAgent is never undefined
  const currentAgent = getCurrentAgent() || mockAgents[0];

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
        {/* Top Header - currentAgent is now guaranteed to be defined */}
        <Header 
          currentAgent={currentAgent}
          user={mockUser}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Welcome Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to LifePilot</h2>
                    <p className="text-gray-600">Your personal health management assistant.</p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors">
                        📄 Upload Health Document
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors">
                        🔍 Search Reports
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors">
                        📊 View Analytics
                      </button>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Health</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Documents:</span>
                        <span className="font-medium text-lg">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Reports:</span>
                        <span className="font-medium text-lg">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Upload:</span>
                        <span className="font-medium text-sm text-gray-500">Never</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="mt-8">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-5xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                        <p className="text-gray-500">Start by uploading your first health document to see your activity here.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Getting Started Section */}
                <div className="mt-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">Getting Started</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">1</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-900">Upload Documents</h3>
                          <p className="text-blue-700 text-sm">Start by uploading your lab results, prescriptions, or medical records.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">2</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-900">AI Analysis</h3>
                          <p className="text-blue-700 text-sm">Our AI will analyze your documents and provide insights.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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