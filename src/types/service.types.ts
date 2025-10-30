// src/types/service.types.ts
// ==================== SERVICE TYPES ====================
// Updated to match Django backend API response exactly

// ==================== SERVICE CATEGORY TYPES ====================
export type ServiceCategoryType = 'diagnostic' | 'nursing' | 'home_care' | 'other';

export interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  type: ServiceCategoryType;
  is_active: boolean;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== BASE SERVICE INTERFACE ====================
export interface BaseService {
  id: number;
  name: string;
  description: string | null;
  base_price: string; // Decimal as string from backend
  discounted_price: string | null; // Decimal as string from backend
  category: ServiceCategory;
  code: string;
  is_active: boolean;
  is_featured: boolean;
  image: string | null;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  final_price: string; // Calculated field from backend
}

// ==================== DIAGNOSTIC TEST TYPES ====================
export type SampleType = 'blood' | 'urine' | 'imaging' | 'other';
export type ReportingType = 'digital' | 'physical' | 'both';

export interface DiagnosticTest extends BaseService {
  sample_type: SampleType;
  is_home_collection: boolean;
  home_collection_fee: string; // Decimal as string from backend
  preparation_instructions: string | null;
  typical_turnaround_time: number; // Hours
  reporting_type: ReportingType;
}

// ==================== NURSING CARE PACKAGE TYPES ====================
export type PackageType = 'hourly' | 'half_day' | 'full_day';
export type TargetGroup = 'elderly' | 'post_surgery' | 'child_care' | 'other';

export interface NursingCarePackage extends BaseService {
  package_type: PackageType;
  included_services: string[] | null; // JSON array from backend
  max_duration: number; // Hours
  target_group: TargetGroup;
}

// ==================== HOME HEALTHCARE SERVICE TYPES ====================
export type HomeHealthcareServiceType = 
  | 'medical_assistance' 
  | 'personal_care' 
  | 'wound_care' 
  | 'medication_management' 
  | 'other';

export type StaffType = 'nurse' | 'caregiver' | 'physiotherapist' | 'doctor';

export interface HomeHealthcareService extends BaseService {
  service_type: HomeHealthcareServiceType;
  staff_type_required: StaffType;
  equipment_needed: string | null;
  max_distance_km: string; // Decimal as string from backend
}

// ==================== LIST FILTERS ====================

// Service Category Filters
export interface ServiceCategoryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  type?: ServiceCategoryType;
  is_active?: boolean;
  ordering?: string;
  
  [key: string]: string | number | boolean | undefined;
}

// Diagnostic Test Filters
export interface DiagnosticTestListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: number; // Category ID
  sample_type?: SampleType;
  is_active?: boolean;
  is_home_collection?: boolean;
  reporting_type?: ReportingType;
  ordering?: string;
  
  [key: string]: string | number | boolean | undefined;
}

// Nursing Care Package Filters
export interface NursingCarePackageListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: number; // Category ID
  package_type?: PackageType;
  is_active?: boolean;
  target_group?: TargetGroup;
  ordering?: string;
  
  [key: string]: string | number | boolean | undefined;
}

// Home Healthcare Service Filters
export interface HomeHealthcareServiceListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: number; // Category ID
  service_type?: HomeHealthcareServiceType;
  is_active?: boolean;
  staff_type_required?: StaffType;
  ordering?: string;
  
  [key: string]: string | number | boolean | undefined;
}

// ==================== CREATE DATA ====================

// Service Category Create
export interface ServiceCategoryCreateData {
  name: string;
  description?: string;
  type: ServiceCategoryType;
  is_active?: boolean;
  icon?: File | string | null;
}

// Base Service Create Data
interface BaseServiceCreateData {
  name: string;
  description?: string;
  base_price: number | string;
  discounted_price?: number | string | null;
  category_id: number;
  code: string;
  is_active?: boolean;
  is_featured?: boolean;
  image?: File | string | null;
  duration_minutes?: number;
}

// Diagnostic Test Create
export interface DiagnosticTestCreateData extends BaseServiceCreateData {
  sample_type: SampleType;
  is_home_collection?: boolean;
  home_collection_fee?: number | string;
  preparation_instructions?: string;
  typical_turnaround_time: number; // Required - hours
  reporting_type?: ReportingType;
}

// Nursing Care Package Create
export interface NursingCarePackageCreateData extends BaseServiceCreateData {
  package_type: PackageType;
  included_services?: string[] | null;
  max_duration: number; // Required - hours
  target_group?: TargetGroup;
}

// Home Healthcare Service Create
export interface HomeHealthcareServiceCreateData extends BaseServiceCreateData {
  service_type: HomeHealthcareServiceType;
  staff_type_required: StaffType;
  equipment_needed?: string;
  max_distance_km?: number | string;
}

// ==================== UPDATE DATA ====================

// Service Category Update
export interface ServiceCategoryUpdateData {
  name?: string;
  description?: string;
  type?: ServiceCategoryType;
  is_active?: boolean;
  icon?: File | string | null;
}

// Base Service Update Data
interface BaseServiceUpdateData {
  name?: string;
  description?: string;
  base_price?: number | string;
  discounted_price?: number | string | null;
  category_id?: number;
  code?: string;
  is_active?: boolean;
  is_featured?: boolean;
  image?: File | string | null;
  duration_minutes?: number;
}

// Diagnostic Test Update
export interface DiagnosticTestUpdateData extends BaseServiceUpdateData {
  sample_type?: SampleType;
  is_home_collection?: boolean;
  home_collection_fee?: number | string;
  preparation_instructions?: string;
  typical_turnaround_time?: number;
  reporting_type?: ReportingType;
}

// Nursing Care Package Update
export interface NursingCarePackageUpdateData extends BaseServiceUpdateData {
  package_type?: PackageType;
  included_services?: string[] | null;
  max_duration?: number;
  target_group?: TargetGroup;
}

// Home Healthcare Service Update
export interface HomeHealthcareServiceUpdateData extends BaseServiceUpdateData {
  service_type?: HomeHealthcareServiceType;
  staff_type_required?: StaffType;
  equipment_needed?: string;
  max_distance_km?: number | string;
}

// ==================== API RESPONSE WRAPPERS ====================
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

// ==================== STATISTICS ====================
export interface ServiceStatistics {
  total_services: number;
  active_services: number;
  featured_services: number;
  services_by_category: {
    [category: string]: number;
  };
  services_by_type: {
    diagnostic: number;
    nursing: number;
    home_care: number;
    other: number;
  };
  average_base_price: number;
  total_categories: number;
}

// ==================== CHOICE OPTIONS (for UI dropdowns) ====================
export const SERVICE_CATEGORY_TYPE_CHOICES = [
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'nursing', label: 'Nursing Care' },
  { value: 'home_care', label: 'Home Healthcare' },
  { value: 'other', label: 'Other' },
] as const;

export const SAMPLE_TYPE_CHOICES = [
  { value: 'blood', label: 'Blood' },
  { value: 'urine', label: 'Urine' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'other', label: 'Other' },
] as const;

export const REPORTING_TYPE_CHOICES = [
  { value: 'digital', label: 'Digital' },
  { value: 'physical', label: 'Physical' },
  { value: 'both', label: 'Both' },
] as const;

export const PACKAGE_TYPE_CHOICES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'full_day', label: 'Full Day' },
] as const;

export const TARGET_GROUP_CHOICES = [
  { value: 'elderly', label: 'Elderly' },
  { value: 'post_surgery', label: 'Post Surgery' },
  { value: 'child_care', label: 'Child Care' },
  { value: 'other', label: 'Other' },
] as const;

export const HOME_SERVICE_TYPE_CHOICES = [
  { value: 'medical_assistance', label: 'Medical Assistance' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'wound_care', label: 'Wound Care' },
  { value: 'medication_management', label: 'Medication Management' },
  { value: 'other', label: 'Other' },
] as const;

export const STAFF_TYPE_CHOICES = [
  { value: 'nurse', label: 'Nurse' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'doctor', label: 'Doctor' },
] as const;