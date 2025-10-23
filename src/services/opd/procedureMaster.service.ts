// src/services/opd/procedureMaster.service.ts
import apiClient from '@/api/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import type {
  ProcedureMaster,
  ProcedureMasterCreateData,
  ProcedureMasterUpdateData,
  ProcedureMasterListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd.types';

// ==================== PROCEDURE MASTERS ====================

export const getProcedureMasters = async (
  params?: ProcedureMasterListParams
): Promise<PaginatedResponse<ProcedureMaster>> => {
  const response = await apiClient.get(OPD_API_CONFIG.PROCEDURE_MASTERS.LIST, {
    params,
  });
  return response.data;
};

export const getProcedureMasterById = async (
  id: number
): Promise<ProcedureMaster> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_MASTERS.DETAIL, { id });
  const response = await apiClient.get<ApiResponse<ProcedureMaster>>(url);
  return response.data.data;
};

export const createProcedureMaster = async (
  data: ProcedureMasterCreateData
): Promise<ProcedureMaster> => {
  const response = await apiClient.post<ApiResponse<ProcedureMaster>>(
    OPD_API_CONFIG.PROCEDURE_MASTERS.CREATE,
    data
  );
  return response.data.data;
};

export const updateProcedureMaster = async (
  id: number,
  data: ProcedureMasterUpdateData
): Promise<ProcedureMaster> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_MASTERS.UPDATE, { id });
  const response = await apiClient.patch<ApiResponse<ProcedureMaster>>(
    url,
    data
  );
  return response.data.data;
};

export const deleteProcedureMaster = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_MASTERS.DELETE, { id });
  await apiClient.delete(url);
};