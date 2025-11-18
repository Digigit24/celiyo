// src/services/opd/findings.service.ts

import { hmsClient } from '@/lib/client';
import { API_CONFIG, buildUrl } from '@/lib/apiConfig';

import type {
  VisitFinding as  Finding,
  VisitFindingCreateData as FindingCreateData ,
  VisitFindingUpdateData as FindingUpdateData,
  VisitFindingListParams as FindingListParams,
 
} from '@/types/opd/visitFinding.types';

import type {
 
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd/common.types';

/**
 * Fetch a paginated list of findings (vital signs, physical exams, etc.)
 * Supports server-side filters like visit_id, finding_type, recorded_at, search, page, ordering.
 */
export const getFindings = async (
  params?: FindingListParams
): Promise<PaginatedResponse<Finding>> => {
  const response = await hmsClient.get(API_CONFIG.VISIT_FINDINGS.LIST, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single finding by ID
 */
export const getFindingById = async (id: number): Promise<Finding> => {
  const url = buildUrl(API_CONFIG.VISIT_FINDINGS.DETAIL, { id });
  const response = await hmsClient.get<ApiResponse<Finding>>(url);
  return response.data.data;
};

/**
 * Create a new finding for a visit
 * e.g. vital signs, physical examination, etc.
 */
export const createFinding = async (
  data: FindingCreateData
): Promise<Finding> => {
  const response = await hmsClient.post<ApiResponse<Finding>>(
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
  const response = await hmsClient.patch<ApiResponse<Finding>>(url, data);
  return response.data.data;
};

/**
 * Delete a finding permanently
 */
export const deleteFinding = async (id: number): Promise<void> => {
  const url = buildUrl(API_CONFIG.VISIT_FINDINGS.DELETE, { id });
  await hmsClient.delete(url);
};