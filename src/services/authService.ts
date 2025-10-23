import apiClient from '@/api/client';
import { API_CONFIG } from '@/lib/apiConfig';
import { LoginPayload, LoginResponse } from '@/types/authTypes';

// Authentication Service
export const authService = {
  // Login user
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(API_CONFIG.AUTH.LOGIN, payload);
      const data = response.data;
      
      // Store token if provided (for token-based auth)
      if (data.token || (data as any).access_token) {
        localStorage.setItem('auth_token', data.token || (data as any).access_token || '');
      }
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('isAuthenticated', 'true');

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract error message from axios error
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Call backend logout endpoint
      await apiClient.post(API_CONFIG.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  },

  // Register user
  register: async (payload: any): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(API_CONFIG.AUTH.REGISTER, payload);
      const data = response.data;
      
      // Store token if provided
      if (data.token || (data as any).access_token) {
        localStorage.setItem('auth_token', data.token || (data as any).access_token || '');
      }
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('isAuthenticated', 'true');

      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<any> => {
    try {
      const response = await apiClient.get(API_CONFIG.AUTH.ME);
      return response.data.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> => {
    try {
      await apiClient.put(API_CONFIG.AUTH.CHANGE_PASSWORD, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // Get stored user
  getUser: (): LoginResponse | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },
};