// src/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/lib/apiConfig';

// Token management with User storage
const TOKEN_KEY = 'hms_auth_token';
const USER_KEY = 'hms_user_data';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  is_active?: boolean;
  is_staff?: boolean;
}

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getUser: (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    
    if (token) {
      // Django Token Auth format: "Token <token>"
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Enhanced logging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      params: config.params,
    });
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      hasData: !!response.data,
    });
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'unknown';
    const status = error.response?.status;

    console.error(`[API Error] ${method} ${url}`, {
      status,
      message: error.response?.data?.message || error.message,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      console.warn('[API] 401 Unauthorized - clearing auth and redirecting');
      
      tokenManager.removeToken();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('[API] Redirecting to login...');
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      console.error('[API] 403 Forbidden:', error.response?.data);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('[API] Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;