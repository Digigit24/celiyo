// src/services/opd/procedurePackage.service.ts
import apiClient from '@/api/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/opdApiConfig';
import type {
  ProcedurePackage,
  ProcedurePackageCreateData,
  ProcedurePackageUpdateData,
  ProcedurePackageListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd.types';

// ==================== PROCEDURE PACKAGES ====================

export const getProcedurePackages = async (
  params?: ProcedurePackageListParams
): Promise<PaginatedResponse<ProcedurePackage>> => {
  const response = await apiClient.get(OPD_API_CONFIG.PROCEDURE_PACKAGES.LIST, {
    params,
  });
  return response.data;
};

export const getProcedurePackageById = async (
  id: number
): Promise<ProcedurePackage> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.DETAIL, { id });
  const response = await apiClient.get<ApiResponse<ProcedurePackage>>(url);
  return response.data.data;
};

export const createProcedurePackage = async (
  data: ProcedurePackageCreateData
): Promise<ProcedurePackage> => {
  const response = await apiClient.post<ApiResponse<ProcedurePackage>>(
    OPD_API_CONFIG.PROCEDURE_PACKAGES.CREATE,
    data
  );
  return response.data.data;
};

export const updateProcedurePackage = async (
  id: number,
  data: ProcedurePackageUpdateData
): Promise<ProcedurePackage> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.UPDATE, { id });
  const response = await apiClient.patch<ApiResponse<ProcedurePackage>>(
    url,
    data
  );
  return response.data.data;
};

export const deleteProcedurePackage = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.DELETE, { id });
  await apiClient.delete(url);
};