// src/hooks/opd/useProcedurePackage.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import {
  getProcedurePackages,
  getProcedurePackageById,
  createProcedurePackage as createPackageService,
  updateProcedurePackage as updatePackageService,
  deleteProcedurePackage as deletePackageService,
} from '@/services/opd/procedurePackage.service';
import { DEFAULT_SWR_OPTIONS, buildQueryString } from './common.hooks';

import type {
  ProcedurePackage,
  ProcedurePackageListParams,
  ProcedurePackageCreateData,
  ProcedurePackageUpdateData,
  PaginatedResponse,
} from '@/types/opd';

/**
 * Shape expectations:
 *
 * ProcedurePackageCreateData (POST):
 * {
 *   name: string;
 *   code: string;
 *   procedures: number[];          // [procedure_id, ...]
 *   total_charge: string;          // "5000.00"
 *   discounted_charge: string;     // "3999.00"
 *   is_active: boolean;
 * }
 *
 * ProcedurePackageUpdateData (PATCH):
 * {
 *   name?: string;
 *   code?: string;
 *   procedures?: number[];
 *   total_charge?: string;
 *   discounted_charge?: string;
 *   is_active?: boolean;
 * }
 *
 * Those should exist in your /types/opd definitions.
 */

// ==================== QUERY HOOKS ====================

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

// CREATE (POST /procedure-packages/)
//
// usage in component:
//   await createProcedurePackage({
//     arg: {
//       name: 'Basic Checkup',
//       code: 'PKG001',
//       procedures: [1,2,3],
//       total_charge: '5000.00',
//       discounted_charge: '3999.00',
//       is_active: true,
//     }
//   })
//
export function useCreateProcedurePackage() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_PACKAGES.CREATE,
    async (
      _key: string,
      { arg }: { arg: ProcedurePackageCreateData }
    ) => {
      return await createPackageService(arg);
    }
  );

  return {
    createProcedurePackage: trigger,
    isCreating: isMutating,
    error,
  };
}

// UPDATE (PATCH /procedure-packages/:id/)
//
// usage in component:
//   await updateProcedurePackage({
//     arg: {
//       // any fields you want to update
//       total_charge: '4800.00',
//       discounted_charge: '4300.00',
//       is_active: false,
//     }
//   })
//
export function useUpdateProcedurePackage(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_PACKAGES.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (
      _key: string,
      { arg }: { arg: ProcedurePackageUpdateData }
    ) => {
      return await updatePackageService(id, arg);
    }
  );

  return {
    updateProcedurePackage: trigger,
    isUpdating: isMutating,
    error,
  };
}

// DELETE (DELETE /procedure-packages/:id/)
//
// usage in component:
//   await deleteProcedurePackage({ arg: someId })
//
// we keep `{ arg }` so it's consistent with create/update
//
export function useDeleteProcedurePackage() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_PACKAGES.LIST,
    async (_key: string, { arg }: { arg: number }) => {
      return await deletePackageService(arg);
    }
  );

  return {
    deleteProcedurePackage: trigger,
    isDeleting: isMutating,
    error,
  };
}
