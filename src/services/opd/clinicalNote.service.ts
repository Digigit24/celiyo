// src/services/opd/clinicalNote.service.ts
import apiClient from '@/api/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import type {
  ClinicalNote,
  ClinicalNoteCreateData,
  ClinicalNoteUpdateData,
  ClinicalNoteListParams,
 
} from '@/types/opd/clinicalNote.types';
import type {
 
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd/common.types';

// ==================== CLINICAL NOTES ====================

export const getClinicalNotes = async (
  params?: ClinicalNoteListParams
): Promise<PaginatedResponse<ClinicalNote>> => {
  const response = await apiClient.get(OPD_API_CONFIG.CLINICAL_NOTES.LIST, {
    params,
  });
  return response.data;
};

export const getClinicalNoteById = async (id: number): Promise<ClinicalNote> => {
  const url = buildOPDUrl(OPD_API_CONFIG.CLINICAL_NOTES.DETAIL, { id });
  const response = await apiClient.get<ApiResponse<ClinicalNote>>(url);
  return response.data.data;
};

export const createClinicalNote = async (
  data: ClinicalNoteCreateData
): Promise<ClinicalNote> => {
  const response = await apiClient.post<ApiResponse<ClinicalNote>>(
    OPD_API_CONFIG.CLINICAL_NOTES.CREATE,
    data
  );
  return response.data.data;
};

export const updateClinicalNote = async (
  id: number,
  data: ClinicalNoteUpdateData
): Promise<ClinicalNote> => {
  const url = buildOPDUrl(OPD_API_CONFIG.CLINICAL_NOTES.UPDATE, { id });
  const response = await apiClient.patch<ApiResponse<ClinicalNote>>(url, data);
  return response.data.data;
};

export const deleteClinicalNote = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.CLINICAL_NOTES.DELETE, { id });
  await apiClient.delete(url);
};