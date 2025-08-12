import React, { useState, useEffect } from 'react';
import { HealthDocumentUploader } from '../../components/agents/health/HealthDocumentUploader';
import { HealthReportsList } from '../../components/agents/health/HealthReportsList';
import { healthService } from '../../services/healthService';
import { HealthDocument, HealthReport } from '../../utils/types';

interface HealthStats {
  totalDocuments: number;
  totalReports: number;
  processing: number;
  lastActivity: string | null;
}

export const HealthDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [stats, setStats] = useState<HealthStats>({
    totalDocuments: 0,
    totalReports: 0,
    processing: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'documents' | 'reports'>('upload');

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const [documentsData, reportsData] = await Promise.all([
        healthService.getDocuments(),
        healthService.getReports()
      ]);
      
      setDocuments(documentsData);
      setReports(reportsData);
      
      // Calculate stats with proper type checking
      setStats({
        totalDocuments: documentsData.length,
        totalReports: reportsData.length,
        processing: documentsData.filter(doc => 
          !(doc.processed || doc.status === 'completed')
        ).length,
        lastActivity: documentsData.length > 0 ? 
          (documentsData[0].uploadedAt || documentsData[0].uploadDate || documentsData[0].createdAt || null) : null
      });
    } catch (err: any) {
      console.error('Failed to load health data:', err);
      // Set empty data on error
      setDocuments([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (documentId: string) => {
    loadHealthData();
  };

  const handleReportSelect = (reportId: string) => {
    window.location.href = `/health/reports/${reportId}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 MB';
    return (bytes / 1024 / 1024).toFixed(2);
  };

  const getDocumentId = (doc: HealthDocument): string => {
    return doc._id || doc.id || 'unknown';
  };

  const getDocumentName = (doc: HealthDocument): string => {
    return doc.originalName || doc.name || doc.filename || 'Unknown Document';
  };

  const getDocumentSize = (doc: HealthDocument): number => {
    return doc.size || doc.fileSize || 0;
  };

  const getUploadDate = (doc: HealthDocument): string => {
    return doc.uploadedAt || doc.uploadDate || doc.createdAt || new Date().toISOString();
  };

  const isDocumentProcessed = (doc: HealthDocument): boolean => {
    return doc.processed === true || doc.status === 'completed';
  };

  const getDocumentStatus = (doc: HealthDocument): string => {
    if (doc.processed || doc.status === 'completed') return '✓ Processed';
    if (doc.status === 'failed') return '✗ Failed';
    return '⏳ Processing';
  };

  const getStatusColor = (doc: HealthDocument): string => {
    if (doc.processed || doc.status === 'completed') return 'bg-green-100 text-green-800';
    if (doc.status === 'failed') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Health Dashboard</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalDocuments}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Reports</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalReports}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Processing</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.processing}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Last Activity</h3>
              <p className="text-sm font-medium text-gray-600 mt-2">
                {stats.lastActivity ? formatDate(stats.lastActivity) : 'Never'}
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
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
                    <button
                      onClick={loadHealthData}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading documents...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">📄</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                      <p className="text-gray-500">Start by uploading your first health document!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc) => (
                        <div key={getDocumentId(doc)} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
                              {getDocumentName(doc)}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc)}`}>
                              {getDocumentStatus(doc)}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Uploaded:</span>{' '}
                              {formatDate(getUploadDate(doc))}
                            </p>
                            <p>
                              <span className="font-medium">Size:</span>{' '}
                              {formatFileSize(getDocumentSize(doc))} MB
                            </p>
                            {doc.entities && doc.entities.length > 0 && (
                              <p>
                                <span className="font-medium">Entities:</span>{' '}
                                {doc.entities.length} found
                              </p>
                            )}
                          </div>
                          
                          {isDocumentProcessed(doc) && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => handleReportSelect(getDocumentId(doc))}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Details →
                              </button>
                            </div>
                          )}
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
    </div>
  );
};