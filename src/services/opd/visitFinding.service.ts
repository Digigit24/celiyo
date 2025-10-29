// src/services/opd/visitFinding.service.ts
import apiClient from '@/api/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import type {
  VisitFinding,
  VisitFindingCreateData,
  VisitFindingUpdateData,
  VisitFindingListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd';

// ==================== VISIT FINDINGS ====================

export const getVisitFindings = async (
  params?: VisitFindingListParams
): Promise<PaginatedResponse<VisitFinding>> => {
  const response = await apiClient.get(OPD_API_CONFIG.VISIT_FINDINGS.LIST, {
    params,
  });
  return response.data;
};

export const getVisitFindingById = async (
  id: number
): Promise<VisitFinding> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISIT_FINDINGS.DETAIL, { id });
  const response = await apiClient.get<ApiResponse<VisitFinding>>(url);
  return response.data.data;
};

export const createVisitFinding = async (
  data: VisitFindingCreateData
): Promise<VisitFinding> => {
  const response = await apiClient.post<ApiResponse<VisitFinding>>(
    OPD_API_CONFIG.VISIT_FINDINGS.CREATE,
    data
  );
  return response.data.data;
};

export const updateVisitFinding = async (
  id: number,
  data: VisitFindingUpdateData
): Promise<VisitFinding> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISIT_FINDINGS.UPDATE, { id });
  const response = await apiClient.patch<ApiResponse<VisitFinding>>(url, data);
  return response.data.data;
};

export const deleteVisitFinding = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISIT_FINDINGS.DELETE, { id });
  await apiClient.delete(url);
};