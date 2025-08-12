import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { HealthDashboard, HealthReportPage } from './pages/Health';
import { HealthReportDetail } from './components/agents/health/HealthReportDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/health" element={<HealthDashboard />} />
          <Route path="/health/reports/:reportId" element={<HealthReportDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;