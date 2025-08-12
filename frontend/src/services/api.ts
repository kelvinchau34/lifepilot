const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const HEALTH_AI_BASE_URL = process.env.REACT_APP_HEALTH_AI_URL || 'http://localhost:8000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  healthAI: HEALTH_AI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// HTTP client wrapper
export const apiClient = {
  async get(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: apiConfig.headers,
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async post(endpoint: string, data?: any, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async uploadFile(endpoint: string, formData: FormData) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData, // Don't set Content-Type for FormData
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
};