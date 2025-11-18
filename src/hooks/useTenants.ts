// src/hooks/useTenants.ts

import { useState, useEffect, useCallback } from 'react';
import {
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  activateTenant,
  deactivateTenant,
  testTenantConnection,
  runTenantMigrations,
  getTenantStats,
  getDashboardStats,
  checkSubdomainAvailability,
  onboardTenant,
  getNeonProjects,
  getNeonBranches,
} from '@/services/tenant.service';
import type {
  Tenant,
  TenantListParams,
  TenantCreateData,
  TenantUpdateData,
  TenantActivateData,
  TenantOnboardData,
  SubdomainCheckResponse,
  TenantStats,
  DashboardStats,
  NeonProject,
  NeonBranch,
  ConnectionTestResponse,
  MigrationResponse,
} from '@/types/tenant.types';

export const useTenants = (initialParams?: TenantListParams) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<TenantListParams>(initialParams || {});

  const fetchTenants = useCallback(async (filterParams?: TenantListParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTenants(filterParams || params);
      setTenants(response.results);
      setCount(response.count);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createNewTenant = async (data: TenantCreateData) => {
    try {
      const newTenant = await createTenant(data);
      setTenants((prev) => [newTenant, ...prev]);
      setCount((prev) => prev + 1);
      return newTenant;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Creation failed');
    }
  };

  const updateExistingTenant = async (id: number, data: TenantUpdateData) => {
    try {
      const updated = await updateTenant(id, data);
      setTenants((prev) =>
        prev.map((tenant) => (tenant.id === id ? updated : tenant))
      );
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Update failed');
    }
  };

  const deleteTenantById = async (id: number) => {
    try {
      await deleteTenant(id);
      setTenants((prev) => prev.filter((tenant) => tenant.id !== id));
      setCount((prev) => prev - 1);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Delete failed');
    }
  };

  const activateTenantById = async (id: number, data?: TenantActivateData) => {
    try {
      const activated = await activateTenant(id, data);
      setTenants((prev) =>
        prev.map((tenant) => (tenant.id === id ? activated : tenant))
      );
      return activated;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Activation failed');
    }
  };

  const deactivateTenantById = async (id: number) => {
    try {
      const deactivated = await deactivateTenant(id);
      setTenants((prev) =>
        prev.map((tenant) => (tenant.id === id ? deactivated : tenant))
      );
      return deactivated;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || err.message || 'Deactivation failed'
      );
    }
  };

  const testConnection = async (id: number): Promise<ConnectionTestResponse> => {
    try {
      return await testTenantConnection(id);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || err.message || 'Connection test failed'
      );
    }
  };

  const runMigrations = async (id: number): Promise<MigrationResponse> => {
    try {
      return await runTenantMigrations(id);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || err.message || 'Migration failed'
      );
    }
  };

  const updateFilters = (newParams: TenantListParams) => {
    setParams(newParams);
    fetchTenants(newParams);
  };

  return {
    tenants,
    count,
    loading,
    error,
    fetchTenants,
    createNewTenant,
    updateExistingTenant,
    deleteTenantById,
    activateTenantById,
    deactivateTenantById,
    testConnection,
    runMigrations,
    updateFilters,
    params,
  };
};

// Hook for single tenant details
export const useTenant = (id: number) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTenantById(id);
      setTenant(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch tenant');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTenant();
    }
  }, [id, fetchTenant]);

  return {
    tenant,
    loading,
    error,
    fetchTenant,
  };
};

// Hook for tenant statistics
export const useTenantStats = (id: number) => {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTenantStats(id);
      setStats(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to fetch stats'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStats();
    }
  }, [id, fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to fetch dashboard stats'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

// Hook for subdomain availability check
export const useSubdomainCheck = () => {
  const [checking, setChecking] = useState<boolean>(false);

  const checkSubdomain = async (
    subdomain: string
  ): Promise<SubdomainCheckResponse> => {
    setChecking(true);
    try {
      return await checkSubdomainAvailability(subdomain);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || err.message || 'Subdomain check failed'
      );
    } finally {
      setChecking(false);
    }
  };

  return {
    checkSubdomain,
    checking,
  };
};

// Hook for tenant onboarding
export const useTenantOnboarding = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onboard = async (data: TenantOnboardData) => {
    setLoading(true);
    setError(null);
    try {
      return await onboardTenant(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Onboarding failed'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    onboard,
    loading,
    error,
  };
};

// Hook for Neon projects
export const useNeonProjects = () => {
  const [projects, setProjects] = useState<NeonProject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNeonProjects();
      setProjects(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to fetch Neon projects'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
  };
};

// Hook for Neon branches
export const useNeonBranches = (projectId: string | null) => {
  const [branches, setBranches] = useState<NeonBranch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getNeonBranches(projectId);
      setBranches(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to fetch branches'
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchBranches();
    }
  }, [projectId, fetchBranches]);

  return {
    branches,
    loading,
    error,
    fetchBranches,
  };
};