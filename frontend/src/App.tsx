import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { HealthDashboard, HealthReportPage } from './pages/Health';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Sidebar } from './components/layout/Sidebar';
import './App.css';

// Define the types we need
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

// Mock data
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

function App() {
  const [activeAgent, setActiveAgent] = useState(mockAgents[0].id);
  const currentAgent = mockAgents.find(agent => agent.id === activeAgent) || mockAgents[0];

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          agents={mockAgents} 
          activeAgent={activeAgent} 
          onAgentChange={setActiveAgent} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            currentAgent={currentAgent}
            user={mockUser}
          />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/health" element={<HealthDashboard />} />
              <Route path="/health/reports/:reportId" element={<HealthReportPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;