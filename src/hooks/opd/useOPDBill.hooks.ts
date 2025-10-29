// src/hooks/opd/useOPDBill.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import {
  getOPDBills,
  getOPDBillById,
  createOPDBill,
  updateOPDBill,
  deleteOPDBill,
  recordPayment,
  printOPDBill,
} from '@/services/opd/opdBill.service';
import { DEFAULT_SWR_OPTIONS, buildQueryString } from './common.hooks';
import type {
  OPDBill,
  OPDBillListParams,
  OPDBillCreateData,
  OPDBillUpdateData,
  PaymentRecordData,
  PaginatedResponse,
} from '@/types/opd';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated OPD bills with filters
 * 
 * @example
 * const { opdBills, count, isLoading } = useOPDBills({ 
 *   payment_status: 'unpaid',
 *   page: 1 
 * });
 */
export function useOPDBills(params?: OPDBillListParams) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.OPD_BILLS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<OPDBill>>(
    url,
    () => getOPDBills(params),
    DEFAULT_SWR_OPTIONS
  );

  return {
    opdBills: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single OPD bill by ID
 * 
 * @example
 * const { opdBill, isLoading, mutate } = useOPDBill(123);
 */
export function useOPDBill(id: number | null) {
  const url = id ? buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<OPDBill>(
    url,
    () => (id ? getOPDBillById(id) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    opdBill: data || null,
    isLoading,
    error,
    mutate,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new OPD bill
 * 
 * @example
 * const { createOPDBill, isCreating, error } = useCreateOPDBill();
 * await createOPDBill({
 *   visit: 123,
 *   doctor: 45,
 *   opd_type: 'consultation',
 *   charge_type: 'first_visit',
 *   total_amount: '500',
 *   received_amount: '500',
 * });
 */
export function useCreateOPDBill() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.OPD_BILLS.CREATE,
    async (_key: string, { arg }: { arg: OPDBillCreateData }) =>
      await createOPDBill(arg)
  );

  return {
    createOPDBill: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook to update an OPD bill
 * 
 * @example
 * const { updateOPDBill, isUpdating, error } = useUpdateOPDBill(123);
 * await updateOPDBill({ diagnosis: 'Updated diagnosis' });
 */
export function useUpdateOPDBill(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: OPDBillUpdateData }) =>
      await updateOPDBill(id, arg)
  );

  return {
    updateOPDBill: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook to delete an OPD bill
 * 
 * @example
 * const { deleteOPDBill, isDeleting, error } = useDeleteOPDBill();
 * await deleteOPDBill(123);
 */
export function useDeleteOPDBill() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.OPD_BILLS.LIST,
    async (_key: string, { arg }: { arg: number }) => await deleteOPDBill(arg)
  );

  return {
    deleteOPDBill: trigger,
    isDeleting: isMutating,
    error,
  };
}

// ==================== ACTION HOOKS ====================

/**
 * Hook to record a payment for an OPD bill
 * 
 * @example
 * const { recordPayment, isRecording, error } = useRecordPayment(123);
 * await recordPayment({
 *   amount: '250',
 *   payment_mode: 'cash',
 *   payment_details: { notes: 'Partial payment' }
 * });
 */
export function useRecordPayment(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.RECORD_PAYMENT, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: PaymentRecordData }) =>
      await recordPayment(id, arg)
  );

  return {
    recordPayment: trigger,
    isRecording: isMutating,
    error,
  };
}

/**
 * Hook to print/generate PDF for an OPD bill
 * 
 * @example
 * const { printBill, isPrinting, error } = usePrintOPDBill(123);
 * const result = await printBill();
 * // result.pdf_url contains the PDF download link
 */
export function usePrintOPDBill(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.OPD_BILLS.PRINT, { id });

  const { trigger, isMutating, error, data } = useSWRMutation(
    url,
    async () => await printOPDBill(id)
  );

  return {
    printBill: trigger,
    isPrinting: isMutating,
    error,
    result: data,
  };
}