// frontend/src/components/agents/health/HealthDocumentUploader.tsx
import React, { useState, useCallback } from 'react';
import Button from '../common/Button/Button';
import { healthService, ProcessingStatus, UploadResponse } from '../../../services/healthService';

interface HealthDocumentUploaderProps {
  onUploadComplete?: (documentId: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
}

export const HealthDocumentUploader: React.FC<HealthDocumentUploaderProps> = ({
  onUploadComplete,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFileSize = 10
}) => {
  const [uploadStatus, setUploadStatus] = useState<ProcessingStatus>({ 
    status: 'uploading', 
    progress: 0 
  });
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setUploadStatus({ 
        status: 'error', 
        progress: 0, 
        message: `File size exceeds ${maxFileSize}MB limit` 
      });
      return;
    }

    setUploadStatus({ status: 'uploading', progress: 0 });

    try {
      // Upload the document
      const uploadResponse: UploadResponse = await healthService.uploadDocument(file, (progress) => {
        setUploadStatus({ status: 'uploading', progress });
      });

      // Start polling for processing status
      setUploadStatus({ status: 'processing', progress: 50, message: 'Processing document...' });
      
      const pollStatus = async () => {
        try {
          const status = await healthService.getProcessingStatus(uploadResponse.reportId);
          setUploadStatus(status);

          if (status.status === 'completed') {
            onUploadComplete?.(uploadResponse.reportId);
            setTimeout(() => {
              setSelectedFile(null);
              setUploadStatus({ status: 'uploading', progress: 0 });
            }, 2000);
          } else if (status.status === 'processing') {
            // Continue polling
            setTimeout(pollStatus, 2000);
          }
        } catch (error) {
          setUploadStatus({ 
            status: 'error', 
            progress: 0, 
            message: 'Failed to process document' 
          });
        }
      };

      // Start polling
      setTimeout(pollStatus, 1000);

    } catch (error) {
      setUploadStatus({ 
        status: 'error', 
        progress: 0, 
        message: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  }, [maxFileSize, onUploadComplete]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setUploadStatus({ status: 'uploading', progress: 0 });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : uploadStatus.status === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={acceptedFileTypes.join(',')}
          onChange={handleInputChange}
          disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {uploadStatus.status === 'uploading' && uploadStatus.progress === 0 && (
            <>
              <p className="text-lg text-gray-600">
                Drop your health document here, or <span className="text-blue-600 font-medium">browse</span>
              </p>
              <p className="text-sm text-gray-500">
                Supports: {acceptedFileTypes.join(', ')} (max {maxFileSize}MB)
              </p>
            </>
          )}
          
          {(uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') && uploadStatus.progress > 0 && (
            <div className="space-y-2">
              <p className="text-lg text-blue-600">
                {uploadStatus.status === 'uploading' ? 'Uploading...' : 'Processing...'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadStatus.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                {uploadStatus.message || `${uploadStatus.progress}%`}
              </p>
              {selectedFile && (
                <p className="text-sm text-gray-600">File: {selectedFile.name}</p>
              )}
            </div>
          )}
          
          {uploadStatus.status === 'completed' && (
            <div className="text-green-600">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Document processed successfully!</p>
              <p className="text-sm text-gray-600 mt-1">AI analysis complete</p>
            </div>
          )}
          
          {uploadStatus.status === 'error' && (
            <div className="text-red-600">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p>Upload failed</p>
              {uploadStatus.message && <p className="text-sm mt-1">{uploadStatus.message}</p>}
            </div>
          )}
        </div>
      </div>
      
      {selectedFile && uploadStatus.status !== 'completed' && uploadStatus.status !== 'error' && (
        <div className="mt-4 flex justify-end space-x-2">
          <Button 
            onClick={cancelUpload}
            variant="secondary"
            disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {uploadStatus.status === 'uploading' && uploadStatus.progress === 0 && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            Choose File
          </Button>
        </div>
      )}
    </div>
  );
};

export default HealthDocumentUploader;