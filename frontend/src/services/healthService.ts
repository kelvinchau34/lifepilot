// frontend/src/services/healthService.ts
import { apiClient } from './api';
import { HealthDocument, HealthReport, ProcessingStatus } from '../utils/types';

export type { HealthDocument, HealthReport, ProcessingStatus };

export const healthService = {
  // Upload and process health document
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<HealthDocument> {
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const result = await apiClient.uploadFile('/api/agents/health/upload', formData);
      return result.document || result;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload document');
    }
  },

  // Get processing status
  async getProcessingStatus(documentId: string): Promise<ProcessingStatus> {
    try {
      return await apiClient.get(`/api/agents/health/documents/${documentId}/status`);
    } catch (error) {
      console.error('Status check error:', error);
      throw new Error('Failed to get processing status');
    }
  },

  // Get all health documents
  async getDocuments(): Promise<HealthDocument[]> {
    try {
      const result = await apiClient.get('/api/agents/health/documents');
      return result.documents || result || [];
    } catch (error) {
      console.error('Get documents error:', error);
      // Return empty array instead of throwing error for better UX
      return [];
    }
  },

  // Get health reports
  async getReports(): Promise<HealthReport[]> {
    try {
      const result = await apiClient.get('/api/agents/health/reports');
      return result.reports || result || [];
    } catch (error) {
      console.error('Get reports error:', error);
      // Return empty array instead of throwing error for better UX
      return [];
    }
  },

  // Get specific report
  async getReport(reportId: string): Promise<HealthReport> {
    try {
      const result = await apiClient.get(`/api/agents/health/reports/${reportId}`);
      return result.report || result;
    } catch (error) {
      console.error('Get report error:', error);
      throw new Error('Failed to fetch report');
    }
  },

  // Generate report from documents
  async generateReport(documentIds: string[], title: string): Promise<HealthReport> {
    try {
      return await apiClient.post('/api/agents/health/reports/generate', {
        documentIds,
        title,
      });
    } catch (error) {
      console.error('Generate report error:', error);
      throw new Error('Failed to generate report');
    }
  },

  // Search documents and reports
  async search(query: string): Promise<{ documents: HealthDocument[], reports: HealthReport[] }> {
    try {
      const result = await apiClient.post('/api/agents/health/search', { query });
      return {
        documents: result.documents || [],
        reports: result.reports || []
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search');
    }
  },

  // Delete document
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await apiClient.post(`/api/agents/health/documents/${documentId}/delete`, {});
    } catch (error) {
      console.error('Delete document error:', error);
      throw new Error('Failed to delete document');
    }
  },

  // Analyze document (trigger AI processing)
  async analyzeDocument(documentId: string): Promise<any> {
    try {
      return await apiClient.post(`/api/agents/health/documents/${documentId}/analyze`, {});
    } catch (error) {
      console.error('Analyze document error:', error);
      throw new Error('Failed to analyze document');
    }
  },
};