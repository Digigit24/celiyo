import axios from 'axios';
import { API_CONFIG } from '@/lib/apiConfig';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // Use Token authentication format for Django REST Framework
      config.headers.Authorization = `Token ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      console.error('401 Unauthorized - Token may be invalid or expired');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         error.response?.data?.detail ||
                         error.message || 
                         'An error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;