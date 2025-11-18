// src/services/opd/opdBill.service.ts
import { hmsClient } from '@/lib/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import type {
  OPDBill,
  OPDBillCreateData,
  OPDBillUpdateData,
  OPDBillListParams,
  PaginatedResponse,
  ApiResponse,
  PaymentMode,
} from '@/types/opd.types';

// ==================== OPD BILLS ====================

export const getOPDBills = async (
  params?: OPDBillListParams
): Promise<PaginatedResponse<OPDBill>> => {
  const response = await hmsClient.get(OPD_API_CONFIG.OPD_BILLS.LIST, { params });
  return response.data;
};

export const getOPDBillById = async (id: number): Promise<OPDBill> => {
  const url = buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.DETAIL, { id });
  const response = await hmsClient.get<OPDBill>(url);
  return response.data;
};

export const createOPDBill = async (
  data: OPDBillCreateData
): Promise<OPDBill> => {
  const response = await hmsClient.post<OPDBill>(
    OPD_API_CONFIG.OPD_BILLS.CREATE,
    data
  );
  return response.data;
};

export const updateOPDBill = async (
  id: number,
  data: OPDBillUpdateData
): Promise<OPDBill> => {
  const url = buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.UPDATE, { id });
  const response = await hmsClient.patch<OPDBill>(url, data);
  return response.data;
};

export const deleteOPDBill = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.DELETE, { id });
  await hmsClient.delete(url);
};

// ==================== OPD BILL ACTIONS ====================

export interface PaymentRecordData {
  amount: string;
  payment_mode: PaymentMode;
  payment_details?: string;
}

export const recordPayment = async (
  id: number,
  data: PaymentRecordData
): Promise<OPDBill> => {
  const url = buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.RECORD_PAYMENT, { id });
  const response = await hmsClient.post<OPDBill>(url, data);
  return response.data;
};

export const printOPDBill = async (
  id: number
): Promise<{ success: boolean; pdf_url: string }> => {
  const url = buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.PRINT, { id });
  const response = await hmsClient.get(url);
  return response.data;
};