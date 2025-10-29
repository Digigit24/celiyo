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
  PaginatedResponse,
} from '@/types/opd';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated procedure bills with filters
 * 
 * @example
 * const { procedureBills, count, isLoading } = useProcedureBills({ 
 *   visit: 123,
 *   payment_status: 'unpaid' 
 * });
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
 * 
 * @example
 * const { procedureBill, isLoading, mutate } = useProcedureBill(123);
 */
export function useProcedureBill(id: number | null) {
  const url = id
    ? buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProcedureBill>(
    url,
    () => (id ? getProcedureBillById(id) : null),
    {
      revalidateOnFocus: false,
    }
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
 * 
 * @example
 * const { items, count, isLoading } = useProcedureBillItems();
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
 * 
 * @example
 * const { item, isLoading } = useProcedureBillItem(123);
 */
export function useProcedureBillItem(id: number | null) {
  const url = id
    ? buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.ITEM_DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProcedureBillItem>(
    url,
    () => (id ? getProcedureBillItemById(id) : null),
    {
      revalidateOnFocus: false,
    }
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
 * Hook to create a new procedure bill with items
 * 
 * @example
 * const { createProcedureBill, isCreating, error } = useCreateProcedureBill();
 * await createProcedureBill({
 *   visit: 123,
 *   doctor: 45,
 *   bill_type: 'hospital',
 *   items: [
 *     { procedure: 1, quantity: 1, unit_charge: '500' },
 *     { procedure: 2, quantity: 2, unit_charge: '250' },
 *   ],
 *   discount_percent: '10',
 *   received_amount: '900',
 * });
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
 * Hook to update a procedure bill
 * Note: Updating items will replace all existing items
 * 
 * @example
 * const { updateProcedureBill, isUpdating, error } = useUpdateProcedureBill(123);
 * await updateProcedureBill({ 
 *   discount_percent: '15',
 *   items: [ ... ] // This replaces all existing items
 * });
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
 * Hook to delete a procedure bill
 * 
 * @example
 * const { deleteProcedureBill, isDeleting, error } = useDeleteProcedureBill();
 * await deleteProcedureBill(123);
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
 * Hook to record a payment for a procedure bill
 * 
 * @example
 * const { recordPayment, isRecording, error } = useRecordProcedureBillPayment(123);
 * await recordPayment({
 *   amount: '450',
 *   payment_mode: 'card',
 *   payment_details: { transaction_id: 'TXN123' }
 * });
 */
export function useRecordProcedureBillPayment(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_BILLS.RECORD_PAYMENT, {
    id,
  });

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
 * Hook to print/generate PDF for a procedure bill
 * 
 * @example
 * const { printBill, isPrinting, error } = usePrintProcedureBill(123);
 * const result = await printBill();
 * // result.pdf_url contains the PDF download link
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