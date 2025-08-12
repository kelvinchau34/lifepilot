import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Button from '../common/Button/Button';

export interface HealthReport {
  id: string;
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  documents: any[];
  createdAt: string;
  updatedAt: string;
}

interface HealthReportsListProps {
  reports: HealthReport[];
  onReportSelect: (reportId: string) => void;
  loading?: boolean;
}

export const HealthReportsList: React.FC<HealthReportsListProps> = ({
  reports,
  onReportSelect,
  loading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-5 bg-gray-300 rounded w-48"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded-full w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No health reports</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading your first health document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Created: {formatDate(report.createdAt)}</span>
                {report.updatedAt !== report.createdAt && (
                  <>
                    <span>•</span>
                    <span>Updated: {formatDate(report.updatedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-2">{report.summary}</p>
          
          {report.keyFindings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Key Findings:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {report.keyFindings.slice(0, 3).map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
                {report.keyFindings.length > 3 && (
                  <li className="text-gray-500">...and {report.keyFindings.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {report.documents.length} document{report.documents.length !== 1 ? 's' : ''}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onReportSelect(report.id)}
            >
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HealthReportsList;