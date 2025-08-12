import React from 'react';
import { useParams } from 'react-router-dom';

export const HealthReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Health Report</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Report ID: {reportId}</h2>
          <p className="text-gray-600">
            This page will show detailed information about the selected health report.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthReportPage;