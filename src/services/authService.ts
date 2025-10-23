import apiClient, { tokenManager } from '@/api/client';
import { API_CONFIG } from '@/lib/apiConfig';

// Auth Types
export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

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

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
}

// Auth Service
export const authService = {
  /**
   * Login user
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
      console.log('[Auth] Attempting login...');
      
      const response = await apiClient.post<{
        success: boolean;
        data: {
          token: string;
          user: User;
        };
      }>(API_CONFIG.AUTH.LOGIN, payload);
      
      if (response.data.success && response.data.data.token) {
        // Store token and user data
        tokenManager.setToken(response.data.data.token);
        tokenManager.setUser(response.data.data.user);
        
        console.log('[Auth] Login successful', {
          username: response.data.data.user.username,
          hasToken: !!response.data.data.token,
        });
        
        return {
          success: true,
          token: response.data.data.token,
          user: response.data.data.user,
        };
      }
      
      throw new Error('Login failed - Invalid response format');
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);
      
      // Extract error message
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.response?.data?.detail ||
        error.message || 
        'Login failed. Please check your credentials.';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Register new user
   */
  register: async (payload: RegisterPayload): Promise<LoginResponse> => {
    try {
      console.log('[Auth] Attempting registration...');
      
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: { token: string; user: User };
      }>(API_CONFIG.AUTH.REGISTER, payload);
      
      if (response.data.success && response.data.data.token) {
        // Store token and user data
        tokenManager.setToken(response.data.data.token);
        tokenManager.setUser(response.data.data.user);
        
        console.log('[Auth] Registration successful');
        
        return {
          success: true,
          token: response.data.data.token,
          user: response.data.data.user,
          message: response.data.message,
        };
      }
      
      throw new Error('Registration failed - Invalid response format');
    } catch (error: any) {
      console.error('[Auth] Registration failed:', error);
      
      // Extract error message
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.response?.data?.detail ||
        error.message || 
        'Registration failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      console.log('[Auth] Fetching current user...');
      
      const response = await apiClient.get<{ 
        success: boolean; 
        data: User;  // User is directly in data, not nested further
      }>(API_CONFIG.AUTH.ME);
      
      // Handle both possible response structures
      let userData: User;
      
      if (response.data.success && response.data.data) {
        // Structure: { success: true, data: { id, email, ... } }
        userData = response.data.data;
      } else if ((response.data as any).id) {
        // Direct structure: { id, email, username, ... }
        userData = response.data as any;
      } else {
        throw new Error('Failed to fetch user data - Invalid response format');
      }
      
      // Update stored user data
      tokenManager.setUser(userData);
      
      console.log('[Auth] User data fetched successfully', {
        id: userData.id,
        email: userData.email,
      });
      
      return userData;
    } catch (error: any) {
      console.error('[Auth] Failed to fetch user:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      console.log('[Auth] Attempting logout...');
      
      // Call backend logout endpoint
      await apiClient.post(API_CONFIG.AUTH.LOGOUT);
      
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout request failed:', error);
      // Continue with local logout even if backend fails
    } finally {
      // Always clear local auth data
      tokenManager.removeToken();
      
      // Redirect to login
      window.location.href = '/login';
    }
  },

  /**
   * Change password
   */
  changePassword: async (
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<void> => {
    try {
      console.log('[Auth] Attempting password change...');
      
      await apiClient.post(API_CONFIG.AUTH.CHANGE_PASSWORD, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      
      console.log('[Auth] Password changed successfully');
    } catch (error: any) {
      console.error('[Auth] Password change failed:', error);
      
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.response?.data?.detail ||
        error.message || 
        'Failed to change password';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return tokenManager.isAuthenticated();
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    return tokenManager.getToken();
  },

  /**
   * Get stored user
   */
  getUser: (): User | null => {
    return tokenManager.getUser();
  },

  /**
   * Validate current token
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        console.warn('[Auth] No token to validate');
        return false;
      }
      
      console.log('[Auth] Validating token...');
      
      // Try to fetch current user
      await authService.getCurrentUser();
      
      console.log('[Auth] Token is valid');
      return true;
    } catch (error) {
      console.error('[Auth] Token validation failed:', error);
      
      // Clear invalid token
      tokenManager.removeToken();
      return false;
    }
  },
};

export default authService;