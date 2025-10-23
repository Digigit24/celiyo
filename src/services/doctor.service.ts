import apiClient from '@/api/client';
import { API_CONFIG } from '@/lib/apiConfig';
import type {
  Doctor,
  DoctorListParams,
  DoctorCreateData,
  DoctorUpdateData,
  SetAvailabilityData,
  Specialty,
  DoctorAvailability,
  PaginatedResponse,
  ApiResponse,
} from '@/types/doctor.types';

// List Doctors with filters
export const getDoctors = async (params?: DoctorListParams): Promise<PaginatedResponse<Doctor>> => {
  const response = await apiClient.get(API_CONFIG.DOCTORS.PROFILES_LIST, { params });
  return response.data;
};

// Get single doctor by ID
export const getDoctorById = async (id: number): Promise<Doctor> => {
  const url = API_CONFIG.DOCTORS.PROFILE_DETAIL.replace(':id', String(id));
  const response = await apiClient.get<ApiResponse<Doctor>>(url);
  return response.data.data;
};

// Create new doctor (registration)
export const createDoctor = async (data: DoctorCreateData): Promise<ApiResponse<Doctor>> => {
  const response = await apiClient.post<ApiResponse<Doctor>>(API_CONFIG.DOCTORS.REGISTER, data);
  return response.data;
};

// Update doctor
export const updateDoctor = async (id: number, data: DoctorUpdateData): Promise<Doctor> => {
  const url = API_CONFIG.DOCTORS.PROFILE_UPDATE.replace(':id', String(id));
  const response = await apiClient.patch<ApiResponse<Doctor>>(url, data);
  return response.data.data;
};

// Delete doctor (soft delete - set inactive)
export const deleteDoctor = async (id: number): Promise<void> => {
  const url = API_CONFIG.DOCTORS.PROFILE_DELETE.replace(':id', String(id));
  await apiClient.delete(url);
};

// Get doctor availability
export const getDoctorAvailability = async (doctorId: number): Promise<DoctorAvailability[]> => {
  const url = API_CONFIG.DOCTORS.AVAILABILITY_LIST.replace(':id', String(doctorId));
  const response = await apiClient.get<ApiResponse<DoctorAvailability[]>>(url);
  return response.data.data;
};

// Set doctor availability
export const setDoctorAvailability = async (
  doctorId: number,
  data: SetAvailabilityData
): Promise<DoctorAvailability> => {
  const url = API_CONFIG.DOCTORS.AVAILABILITY_CREATE.replace(':id', String(doctorId));
  const response = await apiClient.post<ApiResponse<DoctorAvailability>>(url, data);
  return response.data.data;
};

// Get doctor statistics
export const getDoctorStatistics = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(API_CONFIG.DOCTORS.STATISTICS);
  return response.data.data;
};

// Get all specialties
export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get<PaginatedResponse<Specialty>>(API_CONFIG.DOCTORS.SPECIALTIES_LIST);
  return response.data.results;
};

// Create specialty
export const createSpecialty = async (data: Partial<Specialty>): Promise<Specialty> => {
  const response = await apiClient.post<ApiResponse<Specialty>>(API_CONFIG.DOCTORS.SPECIALTY_CREATE, data);
  return response.data.data;
};

// Update specialty
export const updateSpecialty = async (id: number, data: Partial<Specialty>): Promise<Specialty> => {
  const url = API_CONFIG.DOCTORS.SPECIALTY_UPDATE.replace(':id', String(id));
  const response = await apiClient.patch<ApiResponse<Specialty>>(url, data);
  return response.data.data;
};

// Delete specialty
export const deleteSpecialty = async (id: number): Promise<void> => {
  const url = API_CONFIG.DOCTORS.SPECIALTY_DELETE.replace(':id', String(id));
  await apiClient.delete(url);
};