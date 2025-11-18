// src/services/opd/procedureBill.service.ts
import { hmsClient } from '@/lib/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import type {
  ProcedureBill,
  ProcedureBillCreateData,
  ProcedureBillUpdateData,
  ProcedureBillListParams,
  PaymentRecordData,
  ProcedureBillItem,
} from '@/types/opd/procedureBill.types';
import type {
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd/common.types';

// ==================== PROCEDURE BILLS ====================

export const getProcedureBills = async (
  params?: ProcedureBillListParams
): Promise<PaginatedResponse<ProcedureBill>> => {
  const response = await hmsClient.get(OPD_API_CONFIG.PROCEDURE_BILLS.LIST, {
    params,
  });
  return response.data;
};

export const getProcedureBillById = async (
  id: number
): Promise<ProcedureBill> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.DETAIL, { id });
  const response = await hmsClient.get<ProcedureBill>(url);
  // Return data directly, not wrapped
  return response.data;
};

export const createProcedureBill = async (
  data: ProcedureBillCreateData
): Promise<ProcedureBill> => {
  const response = await hmsClient.post<ProcedureBill>(
    OPD_API_CONFIG.PROCEDURE_BILLS.CREATE,
    data
  );
  return response.data;
};

export const updateProcedureBill = async (
  id: number,
  data: ProcedureBillUpdateData
): Promise<ProcedureBill> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.UPDATE, { id });
  const response = await hmsClient.patch<ProcedureBill>(url, data);
  return response.data;
};

export const deleteProcedureBill = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.DELETE, { id });
  await hmsClient.delete(url);
};

// ==================== PROCEDURE BILL ACTIONS ====================

export const recordProcedureBillPayment = async (
  id: number,
  data: PaymentRecordData
): Promise<ProcedureBill> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.RECORD_PAYMENT, { id });
  const response = await hmsClient.post<ProcedureBill>(url, data);
  return response.data;
};

export const printProcedureBill = async (
  id: number
): Promise<{ success: boolean; pdf_url: string }> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.PRINT, { id });
  const response = await hmsClient.get<{ success: boolean; pdf_url: string }>(url);
  return response.data;
};

// ==================== PROCEDURE BILL ITEMS ====================

export const getProcedureBillItems = async (): Promise<PaginatedResponse<ProcedureBillItem>> => {
  const response = await hmsClient.get<PaginatedResponse<ProcedureBillItem>>(
    OPD_API_CONFIG.PROCEDURE_BILLS.ITEMS_LIST
  );
  return response.data;
};

export const getProcedureBillItemById = async (
  id: number
): Promise<ProcedureBillItem> => {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.ITEM_DETAIL, { id });
  const response = await hmsClient.get<ProcedureBillItem>(url);
  return response.data;
};