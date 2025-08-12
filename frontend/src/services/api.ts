import axios, { AxiosInstance, AxiosResponse } from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const HEALTH_AI_BASE_URL = process.env.REACT_APP_HEALTH_AI_URL || 'http://localhost:8001';

// Create axios instance for main API
const apiInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiConfig = {
  baseURL: API_BASE_URL,
  healthAI: HEALTH_AI_BASE_URL,
};

// HTTP client wrapper
export const apiClient = {
  async get(endpoint: string, config?: any) {
    const response = await apiInstance.get(endpoint, config);
    return response.data;
  },

  async post(endpoint: string, data?: any, config?: any) {
    const response = await apiInstance.post(endpoint, data, config);
    return response.data;
  },

  async put(endpoint: string, data?: any, config?: any) {
    const response = await apiInstance.put(endpoint, data, config);
    return response.data;
  },

  async delete(endpoint: string, config?: any) {
    const response = await apiInstance.delete(endpoint, config);
    return response.data;
  },

  async uploadFile(endpoint: string, formData: FormData, onProgress?: (progress: number) => void) {
    const response = await apiInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },
};