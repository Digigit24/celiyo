// src/hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { authService } from '@/services/authService';
import { LoginPayload, User } from '@/types/authTypes';

export const useAuth = () => {
  // Use try-catch to handle cases where useNavigate is called outside Router context
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn('useNavigate called outside Router context, navigation will use window.location');
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get user from localStorage initially
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  // Check authentication status
  const isAuthenticated = authService.isAuthenticated();

  // Update user state when auth service user changes
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [isAuthenticated]);

  // Helper function for navigation
  const navigateTo = useCallback((path: string, replace = false) => {
    if (navigate) {
      navigate(path, { replace });
    } else {
      // Fallback to window.location if navigate is not available
      if (replace) {
        window.location.replace(path);
      } else {
        window.location.href = path;
      }
    }
  }, [navigate]);

  // Login function
  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const loggedInUser = await authService.login(payload);
      
      // Update local state
      setUser(loggedInUser);
      
      // Clear any existing SWR cache to ensure fresh data
      mutate(() => true, undefined, { revalidate: false });
      
      // Navigate to dashboard
      navigateTo('/', true);
      
      return loggedInUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigateTo]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Update local state
      setUser(null);
      
      // Clear all SWR cache
      mutate(() => true, undefined, { revalidate: false });
      
      // Navigate to login
      navigateTo('/login', true);
    }
  }, [navigateTo]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  }, []);

  // Check if user has access to a specific module
  const hasModuleAccess = useCallback((module: string) => {
    return authService.hasModuleAccess(module);
  }, [user]);

  // Get tenant information
  const getTenant = useCallback(() => {
    return authService.getTenant();
  }, [user]);

  // Get user roles
  const getUserRoles = useCallback(() => {
    return authService.getUserRoles();
  }, [user]);

  // Verify token validity
  const verifyToken = useCallback(async () => {
    try {
      const isValid = await authService.verifyToken();
      if (!isValid) {
        // Token is invalid, logout user
        await logout();
        return false;
      }
      return true;
    } catch (err) {
      console.error('Token verification failed:', err);
      await logout();
      return false;
    }
  }, [logout]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    hasModuleAccess,
    getTenant,
    getUserRoles,
    verifyToken,
    clearError,
  };
};

// Legacy AuthProvider component for backward compatibility
import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  hasModuleAccess: (module: string) => boolean;
  getTenant: () => any;
  getUserRoles: () => any[];
  verifyToken: () => Promise<boolean>;
  clearError: () => void;
  // Legacy methods
  register?: (payload: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Legacy register function (not implemented in multi-tenant)
  const register = useCallback(async (payload: any) => {
    throw new Error('Registration not available in multi-tenant architecture');
  }, []);

  const value: AuthContextType = {
    ...auth,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Legacy context hook
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}