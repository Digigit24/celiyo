// src/services/opd/findings.service.ts

import apiClient from '@/api/client';
import { API_CONFIG, buildUrl } from '@/lib/apiConfig';

import type {
  Finding,
  FindingCreateData,
  FindingUpdateData,
  FindingListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd.types';

/**
 * Fetch a paginated list of findings (vital signs, physical exams, etc.)
 * Supports server-side filters like visit_id, finding_type, recorded_at, search, page, ordering.
 */
export const getFindings = async (
  params?: FindingListParams
): Promise<PaginatedResponse<Finding>> => {
  const response = await apiClient.get(API_CONFIG.VISIT_FINDINGS.LIST, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single finding by ID
 */
export const getFindingById = async (id: number): Promise<Finding> => {
  const url = buildUrl(API_CONFIG.VISIT_FINDINGS.DETAIL, { id });
  const response = await apiClient.get<ApiResponse<Finding>>(url);
  return response.data.data;
};

/**
 * Create a new finding for a visit
 * e.g. vital signs, physical examination, etc.
 */
export const createFinding = async (
  data: FindingCreateData
): Promise<Finding> => {
  const response = await apiClient.post<ApiResponse<Finding>>(
    API_CONFIG.VISIT_FINDINGS.CREATE,
    data
  );
  return response.data.data;
};

/**
 * Update an existing finding (PATCH)
 * Only send changed fields using FindingUpdateData (Partial<FindingCreateData>)
 */
export const updateFinding = async (
  id: number,
  data: FindingUpdateData
): Promise<Finding> => {
  const url = buildUrl(API_CONFIG.VISIT_FINDINGS.UPDATE, { id });
  const response = await apiClient.patch<ApiResponse<Finding>>(url, data);
  return response.data.data;
};

/**
 * Delete a finding permanently
 */
export const deleteFinding = async (id: number): Promise<void> => {
  const url = buildUrl(API_CONFIG.VISIT_FINDINGS.DELETE, { id });
  await apiClient.delete(url);
};