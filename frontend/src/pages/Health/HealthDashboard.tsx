import React, { useState, useEffect } from 'react';
import { HealthDocumentUploader } from '../../components/agents/health/HealthDocumentUploader';
import { HealthReportsList, HealthReport } from '../../components/agents/health/HealthReportsList';
import { healthService, HealthDocument } from '../../services/healthService';

export const HealthDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'documents' | 'reports'>('upload');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsResult, reportsResult] = await Promise.all([
        healthService.getDocuments(),
        healthService.getReports()
      ]);
      setDocuments(docsResult);
      setReports(reportsResult);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (documentId: string) => {
    // Reload data after successful upload
    loadData();
  };

  const handleReportSelect = (reportId: string) => {
    // Navigate to report details
    window.location.href = `/health/reports/${reportId}`;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Health Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Documents</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{documents.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Reports</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{reports.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Processing</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {documents.filter(doc => !doc.processed).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'upload', label: 'Upload Documents', icon: '📤' },
                { id: 'documents', label: 'My Documents', icon: '📄' },
                { id: 'reports', label: 'Health Reports', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  Upload Health Document
                </h2>
                <HealthDocumentUploader onUploadComplete={handleUploadComplete} />
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Documents</h2>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No documents uploaded yet. Start by uploading your first health document!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900">{doc.originalName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Size: {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.processed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.processed ? '✓ Processed' : '⏳ Processing'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Health Reports</h2>
                <HealthReportsList 
                  reports={reports} 
                  onReportSelect={handleReportSelect} 
                  loading={loading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;