import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

interface Entity {
  text: string;
  label: string;
  confidence: number;
  start: number;
  end: number;
}

interface Embedding {
  vector: number[];
  text: string;
  chunkIndex: number;
}

interface HealthReport {
  _id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  extractedText: string;
  entities: Entity[];
  entityGroups: Record<string, Entity[]>;
  embeddings?: Embedding[];
  summary?: string;
  reportDate?: string;
  uploadDate: string;
  status: string;
}

export const HealthReportDetail: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'entities' | 'summary'>('text');

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/agents/health/reports/${reportId}`);
        if (response.data.success) {
          setReport(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch report details');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching report details');
        console.error('Error fetching report details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReportDetail();
    }
  }, [reportId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getEntityColor = (label: string) => {
    const colors: Record<string, { bg: string, text: string }> = {
      'Disease_disorder': { bg: 'bg-red-100', text: 'text-red-800' },
      'Medication': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Lab_value': { bg: 'bg-green-100', text: 'text-green-800' },
      'Diagnostic_procedure': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Therapeutic_procedure': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      'Sign_symptom': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Detailed_description': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'Dosage': { bg: 'bg-pink-100', text: 'text-pink-800' }
    };
    
    return colors[label] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  const renderHighlightedText = () => {
    if (!report || !report.extractedText || !report.entities || report.entities.length === 0) {
      return <p className="whitespace-pre-line">{report?.extractedText || ''}</p>;
    }

    // Sort entities by start position
    const sortedEntities = [...report.entities].sort((a, b) => a.start - b.start);
    
    // Create text segments
    const segments: { text: string; entity?: Entity }[] = [];
    let lastIndex = 0;

    sortedEntities.forEach(entity => {
      // Add text before the entity
      if (entity.start > lastIndex) {
        segments.push({ text: report.extractedText.substring(lastIndex, entity.start) });
      }
      
      // Add the entity text
      segments.push({ 
        text: report.extractedText.substring(entity.start, entity.end),
        entity
      });
      
      lastIndex = entity.end;
    });

    // Add any remaining text
    if (lastIndex < report.extractedText.length) {
      segments.push({ text: report.extractedText.substring(lastIndex) });
    }

    // Render with highlighting
    return (
      <p className="whitespace-pre-line">
        {segments.map((segment, index) => {
          if (!segment.entity) {
            return <span key={index}>{segment.text}</span>;
          }
          
          const { bg, text } = getEntityColor(segment.entity.label);
          return (
            <span 
              key={index} 
              className={`${bg} ${text} px-1 rounded cursor-pointer`}
              title={`${segment.entity.label} (${(segment.entity.confidence * 100).toFixed(0)}% confidence)`}
            >
              {segment.text}
            </span>
          );
        })}
      </p>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Error</p>
          <p className="mt-1">{error || 'Report not found'}</p>
          <Link 
            to="/health" 
            className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            ← Back to reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{report.filename}</h1>
          <Link 
            to="/health" 
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            ← Back to reports
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 gap-4">
          <span>Uploaded on {formatDate(report.uploadDate)}</span>
          <span>{formatFileSize(report.fileSize)}</span>
          <span>
            {report.status === 'completed' ? (
              <span className="text-green-600">Processed Successfully</span>
            ) : report.status === 'processing' ? (
              <span className="text-yellow-600">Processing...</span>
            ) : (
              <span className="text-red-600">Processing Failed</span>
            )}
          </span>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'text'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Document Text
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'entities'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medical Entities
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Summary
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'text' && (
          <div className="prose max-w-none">
            {renderHighlightedText()}
          </div>
        )}
        
        {activeTab === 'entities' && report.entityGroups && (
          <div className="space-y-6">
            {Object.entries(report.entityGroups).map(([type, entities]) => (
              <div key={type} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">{type.replace('_', ' ')}</h3>
                <div className="flex flex-wrap gap-2">
                  {entities.map((entity, idx) => {
                    const { bg, text } = getEntityColor(entity.label);
                    return (
                      <div 
                        key={idx}
                        className={`${bg} ${text} px-3 py-1 rounded-full text-sm flex items-center`}
                      >
                        <span>{entity.text}</span>
                        <span className="ml-1 text-xs opacity-75">
                          ({(entity.confidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'summary' && (
          <div>
            {report.summary ? (
              <div className="prose max-w-none">
                <p>{report.summary}</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <svg 
                  className="w-12 h-12 text-gray-400 mx-auto mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No summary available</h3>
                <p className="mt-1 text-gray-500">
                  The summary for this document is not available yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthReportDetail;