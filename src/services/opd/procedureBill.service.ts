// src/services/opd/procedureBill.service.ts
import apiClient from '@/api/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/opdApiConfig';
import type {
  ProcedureBill,
  ProcedureBillCreateData,
  ProcedureBillUpdateData,
  ProcedureBillListParams,
  PaymentRecordData,
  ProcedureBillItem,
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd.types';

// ==================== PROCEDURE BILLS ====================

export const getProcedureBills = async (
  params?: ProcedureBillListParams
): Promise<PaginatedResponse<ProcedureBill>> => {
  const response = await apiClient.get(OPD_API_CONFIG.PROCEDURE_BILLS.LIST, {
    params,
  });
  return response.data;
};

export const getProcedureBillById = async (
  id: number
): Promise<ProcedureBill> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.DETAIL, { id });
  const response = await apiClient.get<ApiResponse<ProcedureBill>>(url);
  return response.data.data;
};

export const createProcedureBill = async (
  data: ProcedureBillCreateData
): Promise<ProcedureBill> => {
  const response = await apiClient.post<ApiResponse<ProcedureBill>>(
    OPD_API_CONFIG.PROCEDURE_BILLS.CREATE,
    data
  );
  return response.data.data;
};

export const updateProcedureBill = async (
  id: number,
  data: ProcedureBillUpdateData
): Promise<ProcedureBill> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.UPDATE, { id });
  const response = await apiClient.patch<ApiResponse<ProcedureBill>>(url, data);
  return response.data.data;
};

export const deleteProcedureBill = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.DELETE, { id });
  await apiClient.delete(url);
};

// ==================== PROCEDURE BILL ACTIONS ====================

export const recordProcedureBillPayment = async (
  id: number,
  data: PaymentRecordData
): Promise<ApiResponse<ProcedureBill>> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.RECORD_PAYMENT, { id });
  const response = await apiClient.post<ApiResponse<ProcedureBill>>(url, data);
  return response.data;
};

export const printProcedureBill = async (
  id: number
): Promise<{ success: boolean; pdf_url: string }> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.PRINT, { id });
  const response = await apiClient.get(url);
  return response.data;
};

// ==================== PROCEDURE BILL ITEMS ====================

export const getProcedureBillItems = async (): Promise<
  PaginatedResponse<ProcedureBillItem>
> => {
  const response = await apiClient.get(OPD_API_CONFIG.PROCEDURE_BILLS.ITEMS_LIST);
  return response.data;
};

export const getProcedureBillItemById = async (
  id: number
): Promise<ProcedureBillItem> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.ITEM_DETAIL, { id });
  const response = await apiClient.get<ApiResponse<ProcedureBillItem>>(url);
  return response.data.data;
};