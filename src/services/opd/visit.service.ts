// src/services/opd/visit.service.ts
import apiClient from '@/api/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import type {
  Visit,
  VisitCreateData,
  VisitUpdateData,
  VisitListParams,
  VisitStatistics,
 
} from '@/types/opd/visit.types';

import type {
 
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd/common.types';

// ==================== VISITS ====================

export const getVisits = async (
  params?: VisitListParams
): Promise<PaginatedResponse<Visit>> => {
  const response = await apiClient.get(OPD_API_CONFIG.VISITS.LIST, { params });
  return response.data;
};

export const getVisitById = async (id: number): Promise<Visit> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISITS.DETAIL, { id });
  const response = await apiClient.get<Visit>(url);
  // API returns visit directly, not wrapped
  return response.data;
};

export const createVisit = async (data: VisitCreateData): Promise<Visit> => {
  const response = await apiClient.post<ApiResponse<Visit>>(
    OPD_API_CONFIG.VISITS.CREATE,
    data
  );
  return response.data.data;
};

export const updateVisit = async (
  id: number,
  data: VisitUpdateData
): Promise<Visit> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISITS.UPDATE, { id });
  const response = await apiClient.patch<ApiResponse<Visit>>(url, data);
  return response.data.data;
};

export const deleteVisit = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISITS.DELETE, { id });
  await apiClient.delete(url);
};

// ==================== VISIT ACTIONS ====================

// Modified: Now returns just the Visit[] array for easier use in components
export const getTodayVisits = async (): Promise<Visit[]> => {
  const response = await apiClient.get<{
    success: boolean;
    count: number;
    data: Visit[];
  }>(OPD_API_CONFIG.VISITS.TODAY);
  return response.data.data;
};

// Keep original for backward compatibility
export const getTodayVisitsRaw = async (): Promise<{
  success: boolean;
  count: number;
  data: Visit[];
}> => {
  const response = await apiClient.get(OPD_API_CONFIG.VISITS.TODAY);
  return response.data;
};

export const getQueue = async (): Promise<{
  success: boolean;
  count: number;
  data: Visit[];
}> => {
  const response = await apiClient.get(OPD_API_CONFIG.VISITS.QUEUE);
  return response.data;
};

// NEW: Added for the new UI - returns structured queue data
export const getVisitQueue = async (): Promise<{
  waiting: Visit[];
  called: Visit[];
  in_consultation: Visit[];
}> => {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      waiting: Visit[];
      called: Visit[];
      in_consultation: Visit[];
    };
  }>(OPD_API_CONFIG.VISITS.QUEUE);
  return response.data.data;
};

export const callNextPatient = async (): Promise<{
  success: boolean;
  message: string;
  data: Visit | null;
}> => {
  const response = await apiClient.post(OPD_API_CONFIG.VISITS.CALL_NEXT);
  return response.data;
};

export const completeVisit = async (
  id: number
): Promise<ApiResponse<Visit>> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISITS.COMPLETE, { id });
  const response = await apiClient.post<ApiResponse<Visit>>(url);
  return response.data;
};

// Modified: Now returns just the VisitStatistics data for easier use
export const getVisitStatistics = async (
  period: 'day' | 'week' | 'month' = 'day'
): Promise<VisitStatistics> => {
  const response = await apiClient.get<ApiResponse<VisitStatistics>>(
    OPD_API_CONFIG.VISITS.STATISTICS,
    { params: { period } }
  );
  return response.data.data;
};

// Keep original for backward compatibility
export const getVisitStatisticsRaw = async (
  params?: { start_date?: string; end_date?: string }
): Promise<ApiResponse<VisitStatistics>> => {
  const response = await apiClient.get<ApiResponse<VisitStatistics>>(
    OPD_API_CONFIG.VISITS.STATISTICS,
    { params }
  );
  return response.data;
};