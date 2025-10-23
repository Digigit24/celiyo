// src/hooks/useAuth.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { authService } from '@/services/authService';
import { LoginPayload, User } from '@/types/authTypes';
import { API_CONFIG } from '@/lib/apiConfig';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use SWR to fetch and cache current user
  // Only fetch if authenticated
  const { data: user, error: swrError, mutate: mutateUser } = useSWR<User | null>(
    authService.isAuthenticated() ? API_CONFIG.AUTH.ME : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        if (data) {
          authService.setUser(data);
        }
      },
      onError: (err) => {
        console.error('Failed to fetch user:', err);
        authService.clearAuth();
      }
    }
  );

  // Compute authentication status
  const isAuthenticated = authService.isAuthenticated() && !!user;

  // Login function
  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const loggedInUser = await authService.login(payload);
      
      // Update SWR cache with the logged-in user
      await mutateUser(loggedInUser, false);
      
      // Navigate to dashboard
      navigate('/', { replace: true });
      
      return loggedInUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, mutateUser]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear SWR cache
      await mutateUser(null, false);
      
      // Clear all SWR cache
      mutate(() => true, undefined, { revalidate: false });
      
      // Navigate to login
      navigate('/login', { replace: true });
    }
  }, [navigate, mutateUser]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      await mutateUser(currentUser, false);
      return currentUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  }, [mutateUser]);

  return {
    user: user || null,
    isAuthenticated,
    isLoading: isLoading || (!user && !swrError && authService.isAuthenticated()),
    error: error || (swrError ? 'Failed to load user data' : null),
    login,
    logout,
    refreshUser,
  };
};