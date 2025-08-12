import { apiClient } from './api';

export interface HealthDocument {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
  processed: boolean;
  ocrText?: string;
  entities?: any[];
  embeddings?: number[];
}

export interface HealthReport {
  id: string;
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  documents: HealthDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingStatus {
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  documentId?: string;
}

export const healthService = {
  // Upload and process health document
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<HealthDocument> {
    const formData = new FormData();
    formData.append('document', file);
    
    // If you want to track upload progress
    if (onProgress) {
      // You could implement XMLHttpRequest for progress tracking
      // For now, we'll use the simpler fetch approach
    }

    try {
      const result = await apiClient.uploadFile('/api/agents/health/upload', formData);
      return result.document;
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
      return result.documents || [];
    } catch (error) {
      console.error('Get documents error:', error);
      throw new Error('Failed to fetch documents');
    }
  },

  // Get health reports
  async getReports(): Promise<HealthReport[]> {
    try {
      const result = await apiClient.get('/api/agents/health/reports');
      return result.reports || [];
    } catch (error) {
      console.error('Get reports error:', error);
      throw new Error('Failed to fetch reports');
    }
  },

  // Get specific report
  async getReport(reportId: string): Promise<HealthReport> {
    try {
      const result = await apiClient.get(`/api/agents/health/reports/${reportId}`);
      return result.report;
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
      return await apiClient.post('/api/agents/health/search', { query });
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
};