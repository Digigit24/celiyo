// src/hooks/opd/useProcedureMaster.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import {
  getProcedureMasters,
  getProcedureMasterById,
  createProcedureMaster,
  updateProcedureMaster,
  deleteProcedureMaster,
} from '@/services/opd/procedureMaster.service';
import { DEFAULT_SWR_OPTIONS, buildQueryString } from './common.hooks';
import type {
  ProcedureMaster,
  ProcedureMasterListParams,
  ProcedureMasterCreateData,
  ProcedureMasterUpdateData,
  PaginatedResponse,
} from '@/types/opd';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated procedure masters with filters
 * 
 * @example
 * const { procedureMasters, count, isLoading } = useProcedureMasters({ 
 *   category: 'laboratory',
 *   is_active: true 
 * });
 */
export function useProcedureMasters(params?: ProcedureMasterListParams) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.PROCEDURE_MASTERS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureMaster>
  >(url, () => getProcedureMasters(params), DEFAULT_SWR_OPTIONS);

  return {
    procedureMasters: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single procedure master by ID
 * 
 * @example
 * const { procedureMaster, isLoading, mutate } = useProcedureMaster(123);
 */
export function useProcedureMaster(id: number | null) {
  const url = id
    ? buildOPDUrl(OPD_API_CONFIG.PROCEDURE_MASTERS.DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProcedureMaster>(
    url,
    () => (id ? getProcedureMasterById(id) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    procedureMaster: data || null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch only active procedure masters
 * Useful for dropdowns and selection lists
 * 
 * @example
 * const { procedureMasters, isLoading } = useActiveProcedureMasters('laboratory');
 */
export function useActiveProcedureMasters(category?: string) {
  const params: ProcedureMasterListParams = { is_active: true };
  if (category) {
    params.category = category;
  }

  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.PROCEDURE_MASTERS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureMaster>
  >(url, () => getProcedureMasters(params), DEFAULT_SWR_OPTIONS);

  return {
    procedureMasters: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new procedure master
 * 
 * @example
 * const { createProcedureMaster, isCreating, error } = useCreateProcedureMaster();
 * await createProcedureMaster({
 *   name: 'Complete Blood Count',
 *   code: 'CBC001',
 *   category: 'laboratory',
 *   default_charge: '500',
 * });
 */
export function useCreateProcedureMaster() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_MASTERS.CREATE,
    async (_key: string, { arg }: { arg: ProcedureMasterCreateData }) =>
      await createProcedureMaster(arg)
  );

  return {
    createProcedureMaster: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook to update a procedure master
 * 
 * @example
 * const { updateProcedureMaster, isUpdating, error } = useUpdateProcedureMaster(123);
 * await updateProcedureMaster({ 
 *   default_charge: '550',
 *   is_active: false 
 * });
 */
export function useUpdateProcedureMaster(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_MASTERS.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: ProcedureMasterUpdateData }) =>
      await updateProcedureMaster(id, arg)
  );

  return {
    updateProcedureMaster: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook to delete a procedure master
 * 
 * @example
 * const { deleteProcedureMaster, isDeleting, error } = useDeleteProcedureMaster();
 * await deleteProcedureMaster(123);
 */
export function useDeleteProcedureMaster() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_MASTERS.LIST,
    async (_key: string, { arg }: { arg: number }) =>
      await deleteProcedureMaster(arg)
  );

  return {
    deleteProcedureMaster: trigger,
    isDeleting: isMutating,
    error,
  };
}