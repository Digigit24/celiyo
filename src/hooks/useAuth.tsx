import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { LoginPayload, RegisterPayload, User } from '@/services/authService';
import { tokenManager } from '@/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[useAuth] Initializing auth state...');
        
        // Check if token exists
        const token = tokenManager.getToken();
        const storedUser = tokenManager.getUser();
        
        if (!token) {
          console.log('[useAuth] No token found');
          setIsLoading(false);
          return;
        }
        
        console.log('[useAuth] Token found, validating...');
        
        // Validate token by fetching current user
        const isValid = await authService.validateToken();
        
        if (isValid) {
          const currentUser = tokenManager.getUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            console.log('[useAuth] Auth state initialized successfully');
          }
        } else {
          console.warn('[useAuth] Token validation failed');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('[useAuth] Initialization error:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[useAuth] Login attempt...');
      
      const response = await authService.login(payload);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('[useAuth] Login successful');
      
      // Check for redirect after login
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath && redirectPath !== '/login') {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      console.error('[useAuth] Login error:', errorMessage);
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[useAuth] Register attempt...');
      
      const response = await authService.register(payload);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('[useAuth] Registration successful');
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      console.error('[useAuth] Registration error:', errorMessage);
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      console.log('[useAuth] Logout attempt...');
      
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('[useAuth] Logout successful');
    } catch (err) {
      console.error('[useAuth] Logout error:', err);
      // Still clear local state even if backend fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      console.log('[useAuth] Refreshing user data...');
      
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      console.log('[useAuth] User data refreshed');
    } catch (err) {
      console.error('[useAuth] Refresh user error:', err);
      // Don't clear auth on refresh error, might be temporary
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}