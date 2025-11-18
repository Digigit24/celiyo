// src/services/opd/procedurePackage.service.ts
import { hmsClient } from '@/lib/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import type {
  ProcedurePackage,
  ProcedurePackageCreateData,
  ProcedurePackageUpdateData,
  ProcedurePackageListParams,
} from '@/types/opd/procedurePackage.types';

import type {
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd/common.types';

// ==================== PROCEDURE PACKAGES ====================

export const getProcedurePackages = async (
  params?: ProcedurePackageListParams
): Promise<PaginatedResponse<ProcedurePackage>> => {
  const response = await hmsClient.get(OPD_API_CONFIG.PROCEDURE_PACKAGES.LIST, {
    params,
  });
  return response.data;
};

export const getProcedurePackageById = async (
  id: number
): Promise<ProcedurePackage> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.DETAIL, { id });
  const response = await hmsClient.get<ProcedurePackage>(url);
  // API returns data directly, not wrapped in { data: ... }
  return response.data;
};

export const createProcedurePackage = async (
  data: ProcedurePackageCreateData
): Promise<ProcedurePackage> => {
  const response = await hmsClient.post<ProcedurePackage>(
    OPD_API_CONFIG.PROCEDURE_PACKAGES.CREATE,
    data
  );
  return response.data;
};

export const updateProcedurePackage = async (
  id: number,
  data: ProcedurePackageUpdateData
): Promise<ProcedurePackage> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.UPDATE, { id });
  const response = await hmsClient.patch<ProcedurePackage>(
    url,
    data
  );
  return response.data;
};

export const deleteProcedurePackage = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.DELETE, { id });
  await hmsClient.delete(url);
};