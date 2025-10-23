// ==================== SPECIALTY SERVICE ====================
// All API calls for Specialty CRUD operations

import apiClient from '@/api/client';
import { API_CONFIG } from '@/lib/apiConfig';
import type { 
  Specialty, 
  SpecialtyCreateData,
  SpecialtyUpdateData,
  SpecialtyListParams,
  PaginatedResponse,
  ApiResponse 
} from '@/types/specialty.types';

// ==================== LIST SPECIALTIES ====================
export const getSpecialties = async (
  params?: SpecialtyListParams
): Promise<PaginatedResponse<Specialty>> => {
  const response = await apiClient.get<PaginatedResponse<Specialty>>(
    API_CONFIG.DOCTORS.SPECIALTIES_LIST, 
    { params }
  );
  return response.data;
};

// ==================== GET SPECIALTY BY ID ====================
export const getSpecialtyById = async (id: number): Promise<Specialty> => {
  const url = API_CONFIG.DOCTORS.SPECIALTY_DETAIL.replace(':id', String(id));
  const response = await apiClient.get<ApiResponse<Specialty>>(url);
  return response.data.data;
};

// ==================== CREATE SPECIALTY ====================
export const createSpecialty = async (
  data: SpecialtyCreateData
): Promise<Specialty> => {
  const response = await apiClient.post<ApiResponse<Specialty>>(
    API_CONFIG.DOCTORS.SPECIALTY_CREATE, 
    data
  );
  return response.data.data;
};

// ==================== UPDATE SPECIALTY (PATCH) ====================
export const updateSpecialty = async (
  id: number,
  data: SpecialtyUpdateData
): Promise<Specialty> => {
  const url = API_CONFIG.DOCTORS.SPECIALTY_UPDATE.replace(':id', String(id));
  const response = await apiClient.patch<ApiResponse<Specialty>>(url, data);
  return response.data.data;
};

// ==================== DELETE SPECIALTY ====================
export const deleteSpecialty = async (id: number): Promise<void> => {
  const url = API_CONFIG.DOCTORS.SPECIALTY_DELETE.replace(':id', String(id));
  await apiClient.delete(url);
};