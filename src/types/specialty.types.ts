// ==================== SPECIALTY TYPES ====================
// Matches Django Specialty model and API responses

export interface Specialty {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpecialtyCreateData {
  name: string;
  code: string;
  description?: string;
  department?: string;
  is_active?: boolean;
}

export interface SpecialtyUpdateData {
  name?: string;
  code?: string;
  description?: string;
  department?: string;
  is_active?: boolean;
}

export interface SpecialtyListParams {
  page?: number;
  search?: string;
  department?: string;
  is_active?: boolean;
  ordering?: string;
}

// ==================== API RESPONSE WRAPPERS ====================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}