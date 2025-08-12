export interface User {
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

export interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
}

// Unified HealthDocument interface based on your backend structure
export interface HealthDocument {
  _id?: string;           // MongoDB ID
  id?: string;            // Alternative ID
  filename: string;       // Backend filename
  originalName?: string;  // Original filename
  name?: string;          // Alternative name field
  size?: number;          // File size
  fileSize?: number;      // Alternative size field
  mimetype?: string;      // MIME type
  uploadedAt?: string;    // Upload timestamp
  uploadDate?: string;    // Alternative upload date field
  createdAt?: string;     // Created timestamp
  processed?: boolean;    // Processing status
  status?: 'pending' | 'processing' | 'completed' | 'failed'; // Processing status
  ocrText?: string;       // OCR extracted text
  entities?: any[];       // NER entities
  embeddings?: number[];  // Vector embeddings
  metadata?: any;         // Additional metadata
  path?: string;          // File path
  userId?: string;        // User ID
}

// Unified HealthReport interface based on your backend structure
export interface HealthReport {
  _id?: string;
  id: string;
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  documents: HealthDocument[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  analysisResults?: any;
  metadata?: any;
}

export interface ProcessingStatus {
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  documentId?: string;
}

// Additional interfaces for components
export interface UploadResponse {
  success: boolean;
  message?: string;
  data?: {
    reportId: string;
    filename: string;
    status: string;
  };
  error?: string;
}

export interface SearchResult {
  index: number;
  document: string;
  similarity: number;
  reportId: string;
  reportName: string;
}