// ==================== PATIENT SERVICE ====================
// Complete service layer for Patient module
// Handles all API calls to Django backend

import apiClient from '@/api/client';
import { API_CONFIG } from '@/lib/apiConfig';
import type {
  PatientProfile,
  PatientCreateData,
  PatientUpdateData,
  PatientListParams,
  PaginatedResponse,
  ApiResponse,
  PatientVitals,
  VitalsCreateData,
  PatientAllergy,
  AllergyCreateData,
  PatientMedicalHistory,
  MedicalHistoryCreateData,
  PatientMedication,
  MedicationCreateData,
  PatientStatistics,
} from '@/types/patient.types';

// ==================== PATIENT PROFILE CRUD ====================

/**
 * Get list of patients with optional filters and pagination
 */
export const getPatients = async (
  params?: PatientListParams
): Promise<PaginatedResponse<PatientProfile>> => {
  const response = await apiClient.get(API_CONFIG.PATIENTS.LIST, { params });
  return response.data;
};

/**
 * Get single patient by ID
 */
export const getPatientById = async (id: number): Promise<PatientProfile> => {
  const url = API_CONFIG.PATIENTS.DETAIL.replace(':id', String(id));
  const response = await apiClient.get<ApiResponse<PatientProfile>>(url);
  return response.data.data;
};

/**
 * Create new patient profile
 */
export const createPatient = async (
  data: PatientCreateData
): Promise<PatientProfile> => {
  const response = await apiClient.post<ApiResponse<PatientProfile>>(
    API_CONFIG.PATIENTS.CREATE,
    data
  );
  return response.data.data;
};

/**
 * Update existing patient (PATCH)
 */
export const updatePatient = async (
  id: number,
  data: PatientUpdateData
): Promise<PatientProfile> => {
  const url = API_CONFIG.PATIENTS.UPDATE.replace(':id', String(id));
  const response = await apiClient.patch<ApiResponse<PatientProfile>>(url, data);
  return response.data.data;
};

/**
 * Delete patient
 */
export const deletePatient = async (id: number): Promise<void> => {
  const url = API_CONFIG.PATIENTS.DELETE.replace(':id', String(id));
  await apiClient.delete(url);
};

// ==================== PATIENT VITALS ====================

/**
 * Get vitals history for a patient
 */
export const getPatientVitals = async (
  patientId: number
): Promise<PaginatedResponse<PatientVitals>> => {
  const url = API_CONFIG.PATIENTS.VITALS_LIST.replace(':id', String(patientId));
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Record new vitals for a patient
 */
export const recordPatientVitals = async (
  patientId: number,
  data: VitalsCreateData
): Promise<PatientVitals> => {
  const url = API_CONFIG.PATIENTS.RECORD_VITALS.replace(':id', String(patientId));
  const response = await apiClient.post<ApiResponse<PatientVitals>>(url, data);
  return response.data.data;
};

// ==================== PATIENT ALLERGIES ====================

/**
 * Get allergy list for a patient
 */
export const getPatientAllergies = async (
  patientId: number
): Promise<PaginatedResponse<PatientAllergy>> => {
  const url = API_CONFIG.PATIENTS.ALLERGIES_LIST.replace(':id', String(patientId));
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Add allergy record for a patient
 */
export const addPatientAllergy = async (
  patientId: number,
  data: AllergyCreateData
): Promise<PatientAllergy> => {
  const url = API_CONFIG.PATIENTS.ADD_ALLERGY.replace(':id', String(patientId));
  const response = await apiClient.post<ApiResponse<PatientAllergy>>(url, data);
  return response.data.data;
};

// ==================== PATIENT MEDICAL HISTORY ====================

/**
 * Get medical history for a patient
 */
export const getPatientMedicalHistory = async (
  patientId: number
): Promise<PaginatedResponse<PatientMedicalHistory>> => {
  const url = API_CONFIG.PATIENTS.MEDICAL_HISTORY_LIST.replace(':id', String(patientId));
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Add medical history record for a patient
 */
export const addPatientMedicalHistory = async (
  patientId: number,
  data: MedicalHistoryCreateData
): Promise<PatientMedicalHistory> => {
  const url = API_CONFIG.PATIENTS.ADD_MEDICAL_HISTORY.replace(':id', String(patientId));
  const response = await apiClient.post<ApiResponse<PatientMedicalHistory>>(url, data);
  return response.data.data;
};

// ==================== PATIENT MEDICATIONS ====================

/**
 * Get current medications for a patient
 */
export const getPatientMedications = async (
  patientId: number
): Promise<PaginatedResponse<PatientMedication>> => {
  const url = API_CONFIG.PATIENTS.MEDICATIONS_LIST.replace(':id', String(patientId));
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Add medication record for a patient
 */
export const addPatientMedication = async (
  patientId: number,
  data: MedicationCreateData
): Promise<PatientMedication> => {
  const url = API_CONFIG.PATIENTS.ADD_MEDICATION.replace(':id', String(patientId));
  const response = await apiClient.post<ApiResponse<PatientMedication>>(url, data);
  return response.data.data;
};

// ==================== PATIENT STATISTICS ====================

/**
 * Get patient statistics (Admin only)
 */
export const getPatientStatistics = async (): Promise<PatientStatistics> => {
  const response = await apiClient.get<ApiResponse<PatientStatistics>>(
    API_CONFIG.PATIENTS.STATISTICS
  );
  return response.data.data;
};