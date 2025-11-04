// src/hooks/opd/useProcedureBill.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import {
  getProcedureBills,
  getProcedureBillById,
  createProcedureBill,
  updateProcedureBill,
  deleteProcedureBill,
  recordProcedureBillPayment,
  printProcedureBill,
  getProcedureBillItems,
  getProcedureBillItemById,
} from '@/services/opd/procedureBill.service';
import { DEFAULT_SWR_OPTIONS, buildQueryString } from './common.hooks';
import type {
  ProcedureBill,
  ProcedureBillItem,
  ProcedureBillListParams,
  ProcedureBillCreateData,
  ProcedureBillUpdateData,
  PaymentRecordData,
} from '@/types/opd/procedureBill.types';
import type { PaginatedResponse } from '@/types/opd/common.types';

// ==================== HELPERS ====================

/** Format: PB-YYYYMMDD-#### */
export function formatBillNumber(date: string, seq: number) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `PB-${y}${m}${day}-${String(seq).padStart(4, '0')}`;
}

/**
 * Get next bill number for a given date by reading the count from server
 * (Uses the paginated list "count" for that date and adds +1)
 */
export function useNextBillNumber(billDate?: string | null) {
  const enabled = Boolean(billDate);
  const params: ProcedureBillListParams | undefined = enabled
    ? { bill_date: billDate as string, page: 1, page_size: 1 }
    : undefined;

  const queryString = buildQueryString(params);
  const url = enabled ? `${OPD_API_CONFIG.PROCEDURE_BILLS.LIST}${queryString}` : null;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureBill>
  >(url, () => (enabled ? getProcedureBills(params) : null), {
    ...DEFAULT_SWR_OPTIONS,
    revalidateOnFocus: false,
  });

  const countForDay = data?.count ?? 0;
  const nextSequence = countForDay + 1;
  const nextBillNumber =
    billDate && !isNaN(new Date(billDate).getTime())
      ? formatBillNumber(billDate, nextSequence)
      : '';

  return {
    nextBillNumber,
    nextSequence,
    isLoading,
    error,
    refresh: mutate,
  };
}

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated procedure bills with filters
 */
export function useProcedureBills(params?: ProcedureBillListParams) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.PROCEDURE_BILLS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureBill>
  >(url, () => getProcedureBills(params), DEFAULT_SWR_OPTIONS);

  return {
    procedureBills: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single procedure bill by ID
 */
export function useProcedureBill(id: number | null) {
  const url = id
    ? buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProcedureBill>(
    url,
    () => (id ? getProcedureBillById(id) : null),
    { revalidateOnFocus: false }
  );

  return {
    procedureBill: data || null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch all procedure bill items
 */
export function useProcedureBillItems() {
  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureBillItem>
  >(
    OPD_API_CONFIG.PROCEDURE_BILLS.ITEMS_LIST,
    getProcedureBillItems,
    DEFAULT_SWR_OPTIONS
  );

  return {
    items: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single procedure bill item by ID
 */
export function useProcedureBillItem(id: number | null) {
  const url = id
    ? buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.ITEM_DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProcedureBillItem>(
    url,
    () => (id ? getProcedureBillItemById(id) : null),
    { revalidateOnFocus: false }
  );

  return {
    item: data || null,
    isLoading,
    error,
    mutate,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Create a new procedure bill (pass bill_number when creating)
 */
export function useCreateProcedureBill() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_BILLS.CREATE,
    async (_key: string, { arg }: { arg: ProcedureBillCreateData }) =>
      await createProcedureBill(arg)
  );

  return {
    createProcedureBill: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Update a procedure bill (bill_number is immutable; do not send)
 */
export function useUpdateProcedureBill(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: ProcedureBillUpdateData }) =>
      await updateProcedureBill(id, arg)
  );

  return {
    updateProcedureBill: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Delete a procedure bill
 */
export function useDeleteProcedureBill() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_BILLS.LIST,
    async (_key: string, { arg }: { arg: number }) =>
      await deleteProcedureBill(arg)
  );

  return {
    deleteProcedureBill: trigger,
    isDeleting: isMutating,
    error,
  };
}

// ==================== ACTION HOOKS ====================

/**
 * Record a payment
 */
export function useRecordProcedureBillPayment(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.RECORD_PAYMENT, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: PaymentRecordData }) =>
      await recordProcedureBillPayment(id, arg)
  );

  return {
    recordPayment: trigger,
    isRecording: isMutating,
    error,
  };
}

/**
 * Print/Generate PDF
 */
export function usePrintProcedureBill(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.PRINT, { id });

  const { trigger, isMutating, error, data } = useSWRMutation(
    url,
    async () => await printProcedureBill(id)
  );

  return {
    printBill: trigger,
    isPrinting: isMutating,
    error,
    result: data,
  };
}
