// src/hooks/opd/useProcedurePackage.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import {
  getProcedurePackages,
  getProcedurePackageById,
  createProcedurePackage,
  updateProcedurePackage,
  deleteProcedurePackage,
} from '@/services/opd/procedurePackage.service';
import { DEFAULT_SWR_OPTIONS, buildQueryString } from './common.hooks';
import type {
  ProcedurePackage,
  ProcedurePackageListParams,
  ProcedurePackageCreateData,
  ProcedurePackageUpdateData,
  PaginatedResponse,
} from '@/types/opd';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated procedure packages with filters
 * 
 * @example
 * const { procedurePackages, count, isLoading } = useProcedurePackages({ 
 *   is_active: true 
 * });
 */
export function useProcedurePackages(params?: ProcedurePackageListParams) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.PROCEDURE_PACKAGES.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedurePackage>
  >(url, () => getProcedurePackages(params), DEFAULT_SWR_OPTIONS);

  return {
    procedurePackages: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single procedure package by ID
 * 
 * @example
 * const { procedurePackage, isLoading, mutate } = useProcedurePackage(123);
 */
export function useProcedurePackage(id: number | null) {
  const url = id
    ? buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProcedurePackage>(
    url,
    () => (id ? getProcedurePackageById(id) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    procedurePackage: data || null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch only active procedure packages
 * Useful for dropdowns and selection lists
 * 
 * @example
 * const { procedurePackages, isLoading } = useActiveProcedurePackages();
 */
export function useActiveProcedurePackages() {
  const params: ProcedurePackageListParams = { is_active: true };
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.PROCEDURE_PACKAGES.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedurePackage>
  >(url, () => getProcedurePackages(params), DEFAULT_SWR_OPTIONS);

  return {
    procedurePackages: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new procedure package
 * 
 * @example
 * const { createProcedurePackage, isCreating, error } = useCreateProcedurePackage();
 * await createProcedurePackage({
 *   name: 'Basic Health Checkup',
 *   code: 'PKG001',
 *   procedures: [1, 2, 3], // Array of procedure IDs
 *   total_charge: '2000',
 *   discounted_charge: '1500',
 * });
 */
export function useCreateProcedurePackage() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_PACKAGES.CREATE,
    async (_key: string, { arg }: { arg: ProcedurePackageCreateData }) =>
      await createProcedurePackage(arg)
  );

  return {
    createProcedurePackage: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook to update a procedure package
 * 
 * @example
 * const { updateProcedurePackage, isUpdating, error } = useUpdateProcedurePackage(123);
 * await updateProcedurePackage({ 
 *   discounted_charge: '1400',
 *   is_active: false 
 * });
 */
export function useUpdateProcedurePackage(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: ProcedurePackageUpdateData }) =>
      await updateProcedurePackage(id, arg)
  );

  return {
    updateProcedurePackage: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook to delete a procedure package
 * 
 * @example
 * const { deleteProcedurePackage, isDeleting, error } = useDeleteProcedurePackage();
 * await deleteProcedurePackage(123);
 */
export function useDeleteProcedurePackage() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_PACKAGES.LIST,
    async (_key: string, { arg }: { arg: number }) =>
      await deleteProcedurePackage(arg)
  );

  return {
    deleteProcedurePackage: trigger,
    isDeleting: isMutating,
    error,
  };
}