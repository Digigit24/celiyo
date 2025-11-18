// src/services/tenant.service.ts

import apiClient from '@/api/client';
import { API_CONFIG, buildUrl } from '@/lib/apiConfig';
import type {
  Tenant,
  TenantCreateData,
  TenantUpdateData,
  TenantListParams,
  TenantActivateData,
  TenantOnboardData,
  TenantOnboardResponse,
  SubdomainCheckResponse,
  TenantStats,
  DashboardStats,
  NeonProject,
  NeonBranch,
  ConnectionTestResponse,
  MigrationResponse,
  TenantSettings,
  TenantSettingsUpdateData,
  PaginatedResponse,
  ApiResponse,
} from '@/types/tenant.types';

// LIST Tenants with filters
export const getTenants = async (
  params?: TenantListParams
): Promise<PaginatedResponse<Tenant>> => {
  const response = await apiClient.get(API_CONFIG.TENANTS.LIST, { params });
  return response.data;
};

// GET Tenant by ID
export const getTenantById = async (id: number): Promise<Tenant> => {
  const url = buildUrl(API_CONFIG.TENANTS.DETAIL, { id });
  const response = await apiClient.get<Tenant>(url);
  return response.data;
};

// CREATE Tenant
export const createTenant = async (
  data: TenantCreateData
): Promise<Tenant> => {
  const response = await apiClient.post<Tenant>(
    API_CONFIG.TENANTS.CREATE,
    data
  );
  return response.data;
};

// UPDATE Tenant (PATCH)
export const updateTenant = async (
  id: number,
  data: TenantUpdateData
): Promise<Tenant> => {
  const url = buildUrl(API_CONFIG.TENANTS.UPDATE, { id });
  const response = await apiClient.patch<Tenant>(url, data);
  return response.data;
};

// DELETE Tenant
export const deleteTenant = async (id: number): Promise<void> => {
  const url = buildUrl(API_CONFIG.TENANTS.DELETE, { id });
  await apiClient.delete(url);
};

// ACTIVATE Tenant
export const activateTenant = async (
  id: number,
  data?: TenantActivateData
): Promise<Tenant> => {
  const url = buildUrl(API_CONFIG.TENANTS.ACTIVATE, { id });
  const response = await apiClient.post<Tenant>(url, data || {});
  return response.data;
};

// DEACTIVATE Tenant
export const deactivateTenant = async (id: number): Promise<Tenant> => {
  const url = buildUrl(API_CONFIG.TENANTS.DEACTIVATE, { id });
  const response = await apiClient.post<Tenant>(url);
  return response.data;
};

// TEST Database Connection
export const testTenantConnection = async (
  id: number
): Promise<ConnectionTestResponse> => {
  const url = buildUrl(API_CONFIG.TENANTS.TEST_CONNECTION, { id });
  const response = await apiClient.post<ConnectionTestResponse>(url);
  return response.data;
};

// RUN Migrations
export const runTenantMigrations = async (
  id: number
): Promise<MigrationResponse> => {
  const url = buildUrl(API_CONFIG.TENANTS.RUN_MIGRATIONS, { id });
  const response = await apiClient.post<MigrationResponse>(url);
  return response.data;
};

// GET Tenant Statistics
export const getTenantStats = async (id: number): Promise<TenantStats> => {
  const url = buildUrl(API_CONFIG.TENANTS.STATS, { id });
  const response = await apiClient.get<TenantStats>(url);
  return response.data;
};

// GET Dashboard Statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>(
    API_CONFIG.TENANTS.DASHBOARD
  );
  return response.data;
};

// PUBLIC: Onboard New Tenant (Self-Service)
export const onboardTenant = async (
  data: TenantOnboardData
): Promise<TenantOnboardResponse> => {
  const response = await apiClient.post<TenantOnboardResponse>(
    API_CONFIG.TENANTS.ONBOARD,
    data
  );
  return response.data;
};

// PUBLIC: Check Subdomain Availability
export const checkSubdomainAvailability = async (
  subdomain: string
): Promise<SubdomainCheckResponse> => {
  const response = await apiClient.get<SubdomainCheckResponse>(
    API_CONFIG.TENANTS.CHECK_SUBDOMAIN,
    {
      params: { subdomain },
    }
  );
  return response.data;
};

// GET Neon Projects
export const getNeonProjects = async (): Promise<NeonProject[]> => {
  const response = await apiClient.get<NeonProject[]>(
    API_CONFIG.NEON.PROJECTS
  );
  return response.data;
};

// GET Neon Branches for a Project
export const getNeonBranches = async (
  projectId: string
): Promise<NeonBranch[]> => {
  const url = buildUrl(API_CONFIG.NEON.BRANCHES, { project_id: projectId });
  const response = await apiClient.get<NeonBranch[]>(url);
  return response.data;
};

// GET Tenant Settings
export const getTenantSettings = async (): Promise<
  PaginatedResponse<TenantSettings>
> => {
  const response = await apiClient.get<PaginatedResponse<TenantSettings>>(
    API_CONFIG.TENANTS.SETTINGS_LIST
  );
  return response.data;
};

// UPDATE Tenant Settings
export const updateTenantSettings = async (
  id: number,
  data: TenantSettingsUpdateData
): Promise<TenantSettings> => {
  const url = buildUrl(API_CONFIG.TENANTS.SETTINGS_UPDATE, { id });
  
  // If logo is a File, use FormData
  if (data.logo instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof TenantSettingsUpdateData];
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    });
    const response = await apiClient.patch<TenantSettings>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  
  // Otherwise use JSON
  const response = await apiClient.patch<TenantSettings>(url, data);
  return response.data;
};