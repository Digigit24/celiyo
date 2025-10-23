import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://hms.dglinkup.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';
const IS_AUTH_KEY = 'isAuthenticated';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(IS_AUTH_KEY, 'true');
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(IS_AUTH_KEY);
  },
  
  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  getUser: (): any | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    const token = tokenManager.getToken();
    const isAuth = localStorage.getItem(IS_AUTH_KEY) === 'true';
    return !!token && isAuth;
  },
};

// Request interceptor - Add auth token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    
    if (token && config.headers) {
      // Django REST Framework expects "Token <token>" format
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Log request for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        params: config.params,
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        hasData: !!response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log error for debugging
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Prevent infinite loops
      if (originalRequest._retry) {
        console.error('[Auth] Token refresh failed, logging out');
        handleAuthError();
        return Promise.reject(error);
      }
      
      // Mark request as retried
      originalRequest._retry = true;
      
      // Check if we have a token
      const token = tokenManager.getToken();
      
      if (!token) {
        console.error('[Auth] No token found, redirecting to login');
        handleAuthError();
        return Promise.reject(error);
      }
      
      // Token exists but is invalid/expired
      console.warn('[Auth] Token invalid or expired');
      
      // Try to validate token with /auth/me endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me/`, {
          headers: { Authorization: `Token ${token}` },
        });
        
        // Token is valid, update user data
        if (response.data?.data) {
          tokenManager.setUser(response.data.data);
          // Retry original request
          return apiClient(originalRequest);
        }
      } catch (validateError) {
        console.error('[Auth] Token validation failed');
      }
      
      // Token validation failed, clear auth and redirect
      handleAuthError();
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('[Auth] Access forbidden - insufficient permissions');
      const errorMessage = 'You do not have permission to access this resource';
      return Promise.reject(new Error(errorMessage));
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      const errorMessage = 'Resource not found';
      return Promise.reject(new Error(errorMessage));
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      const errorMessage = 'Server error occurred. Please try again later.';
      return Promise.reject(new Error(errorMessage));
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      const errorMessage = 'Network error. Please check your internet connection.';
      return Promise.reject(new Error(errorMessage));
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      const errorMessage = 'Request timeout. Please try again.';
      return Promise.reject(new Error(errorMessage));
    }
    
    // Extract error message from response
    
  }
);

// Handle authentication errors
function handleAuthError(): void {
  // Clear all auth data
  tokenManager.removeToken();
  
  // Don't redirect if already on login page
  const currentPath = window.location.pathname;
  if (currentPath !== '/login') {
    // Store intended destination for redirect after login
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    
    // Redirect to login
    window.location.href = '/login';
  }
}

// Export helper to check auth status
export const checkAuthStatus = (): boolean => {
  return tokenManager.isAuthenticated();
};

// Export helper to logout
export const logout = (): void => {
  tokenManager.removeToken();
  window.location.href = '/login';
};

export default apiClient;