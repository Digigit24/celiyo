// src/services/authService.ts
import client, { tokenManager } from '@/lib/client';
import { API_CONFIG } from '@/lib/apiConfig';
import { LoginPayload, User } from '@/types/authTypes';

const USER_KEY = 'hms_user';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterPayload extends LoginPayload {
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  password_confirm: string;
  doctor_profile?: any;
  patient_profile?: any;
}

class AuthService {
  // Login
  async login(payload: LoginPayload): Promise<User> {
    try {
      const response = await client.post<LoginResponse>(
        API_CONFIG.AUTH.LOGIN,
        payload
      );

      const { token, user } = response.data.data;

      // Store token and user
      tokenManager.setToken(token);
      this.setUser(user);

      return user;
    } catch (error: any) {
      // Clear any stale data
      this.clearAuth();
      
      const message = error.response?.data?.error || 
                     error.response?.data?.message || 
                     'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  }

  // Register
  async register(payload: RegisterPayload): Promise<User> {
    try {
      const response = await client.post<LoginResponse>(
        API_CONFIG.AUTH.REGISTER,
        payload
      );

      const { token, user } = response.data.data;

      // Store token and user
      tokenManager.setToken(token);
      this.setUser(user);

      return user;
    } catch (error: any) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message || 
                     'Registration failed.';
      throw new Error(message);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await client.post(API_CONFIG.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local auth data
      this.clearAuth();
    }
  }

  // Get current user from API
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      const response = await client.get<{ success: boolean; data: User }>(
        API_CONFIG.AUTH.ME
      );

      const user = response.data.data;
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      this.clearAuth();
      return null;
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await client.post<{ success: boolean; data: { token: string } }>(
        API_CONFIG.AUTH.CHANGE_PASSWORD,
        {
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: newPassword,
        }
      );

      // Update token if returned
      if (response.data.data?.token) {
        tokenManager.setToken(response.data.data.token);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message || 
                     'Password change failed.';
      throw new Error(message);
    }
  }

  // Token methods
  getToken(): string | null {
    return tokenManager.getToken();
  }

  setToken(token: string): void {
    tokenManager.setToken(token);
  }

  removeToken(): void {
    tokenManager.removeToken();
  }

  // User methods
  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return tokenManager.hasToken();
  }

  // Clear all auth data
  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  }
}

export const authService = new AuthService();