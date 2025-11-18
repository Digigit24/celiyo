// src/types/tenant.types.ts

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  subdomain: string;
  custom_domain: string | null;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  is_active: boolean;
  owner: number;
  owner_email: string;
  owner_name: string;
  neon_project_id: string | null;
  neon_branch_id: string | null;
  neon_parent_branch_id: string | null;
  neon_region: string | null;
  neon_db_url: string | null;
  database_alias: string;
  full_domain: string;
  connection_status?: {
    status: string;
    message: string;
  };
  max_users: number;
  max_patients: number;
  storage_limit_gb: number;
  created_at: string;
  updated_at: string;
  activated_at: string | null;
}

export interface TenantListParams {
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface TenantCreateData {
  name: string;
  slug?: string;
  subdomain?: string;
  custom_domain?: string;
  owner: number;
  auto_create_neon?: boolean;
  neon_project_id?: string;
  neon_branch_id?: string;
  neon_parent_branch_id?: string;
  neon_region?: 'aws-us-east-2' | 'aws-us-west-2' | 'aws-eu-central-1' | 'aws-ap-southeast-1';
  neon_db_url?: string;
  max_users?: number;
  max_patients?: number;
  storage_limit_gb?: number;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
}

export interface TenantUpdateData {
  name?: string;
  custom_domain?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  is_active?: boolean;
  max_users?: number;
  max_patients?: number;
  storage_limit_gb?: number;
}

export interface TenantActivateData {
  run_migrations?: boolean;
}

export interface TenantOnboardData {
  hospital_name: string;
  hospital_type: 'hospital' | 'clinic';
  subdomain: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  password: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
}

export interface TenantOnboardResponse {
  success: boolean;
  message: string;
  tenant: {
    id: number;
    name: string;
    slug: string;
    subdomain?: string;
    full_domain?: string;
    status: string;
  };
  owner: {
    email: string;
    name?: string;
  };
  next_steps?: string[];
}

export interface SubdomainCheckResponse {
  subdomain: string;
  available: boolean;
  message: string;
}

export interface TenantStats {
  tenant_id: number;
  tenant_name: string;
  status: string;
  created_at: string;
  activated_at: string | null;
  current_usage: {
    users: number;
    patients: number;
    appointments: number;
    storage_mb: number;
  };
  limits: {
    max_users: number;
    max_patients: number;
    storage_limit_gb: number;
  };
}

export interface DashboardStats {
  total_tenants: number;
  active_tenants: number;
  inactive_tenants: number;
  pending_tenants: number;
  total_users: number;
  total_patients: number;
  recent_tenants: Tenant[];
}

export interface NeonProject {
  id: string;
  name: string;
  region_id: string;
  created_at: string;
  default_branch_id: string;
}

export interface NeonBranch {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  primary: boolean;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  tenant: string;
  database_alias: string;
}

export interface MigrationResponse {
  success: boolean;
  message?: string;
  error?: string;
  database_alias?: string;
}

export interface TenantSettings {
  id: number;
  tenant: number;
  tenant_name: string;
  logo: string | null;
  primary_color: string;
  secondary_color: string;
  enable_appointments: boolean;
  enable_pharmacy: boolean;
  enable_opd: boolean;
  enable_payments: boolean;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface TenantSettingsUpdateData {
  logo?: File | string;
  primary_color?: string;
  secondary_color?: string;
  enable_appointments?: boolean;
  enable_pharmacy?: boolean;
  enable_opd?: boolean;
  enable_payments?: boolean;
  timezone?: string;
  currency?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}