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

/**
 * Take whatever backend gives us and force it into the shape
 * our UI (drawer) expects.
 */
function normalizeProcedureMaster(raw: any): ProcedureMaster {
  if (!raw || typeof raw !== 'object') {
    return {
      // fallback safe object
      id: 0,
      code: '',
      name: '',
      category: 'laboratory',
      description: '',
      default_charge: '0.00',
      is_active: true,
      created_at: null,
      updated_at: null,
    } as unknown as ProcedureMaster;
  }

  // some backends send fields flat (code, name, default_charge ...)
  // some send "procedure_code", "procedure_name", "price", etc.
  // some wrap inside `procedure: { ... }`
  const base = raw.procedure ?? raw; // prefer nested `procedure` if present

  const id =
    raw.id ??
    base.id ??
    raw.pk ??
    0;

  const code =
    base.code ??
    base.procedure_code ??
    raw.code ??
    raw.procedure_code ??
    '';

  const name =
    base.name ??
    base.procedure_name ??
    raw.name ??
    raw.procedure_name ??
    '';

  const category =
    base.category ??
    raw.category ??
    'laboratory';

  const description =
    base.description ??
    base.details ??
    raw.description ??
    raw.details ??
    '';

  // default_charge may come as `default_charge`, `price`, `procedure_price`, etc.
  const default_charge_raw =
    base.default_charge ??
    base.price ??
    base.procedure_price ??
    raw.default_charge ??
    raw.price ??
    raw.procedure_price ??
    '0.00';

  // force to string with 2 decimals if possible
  let default_charge = '0.00';
  if (
    default_charge_raw !== undefined &&
    default_charge_raw !== null &&
    default_charge_raw !== ''
  ) {
    const num = parseFloat(String(default_charge_raw));
    default_charge = isNaN(num)
      ? '0.00'
      : num.toFixed(2);
  }

  const is_active =
    base.is_active ??
    base.active ??
    raw.is_active ??
    raw.active ??
    true;

  const created_at =
    raw.created_at ??
    base.created_at ??
    null;

  const updated_at =
    raw.updated_at ??
    base.updated_at ??
    null;

  return {
    ...raw, // keep any extra fields from backend so details tab can still read them if needed
    id,
    code,
    name,
    category,
    description,
    default_charge,
    is_active,
    created_at,
    updated_at,
  } as ProcedureMaster;
}

// ===== LIST HOOK ===================================================

export function useProcedureMasters(params?: ProcedureMasterListParams) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.PROCEDURE_MASTERS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureMaster>
  >(
    url,
    async () => {
      const resp = await getProcedureMasters(params);
      // normalize each item in the list so table + drawer both get same shape
      return {
        ...resp,
        results: (resp?.results || []).map(normalizeProcedureMaster),
      } as PaginatedResponse<ProcedureMaster>;
    },
    DEFAULT_SWR_OPTIONS
  );

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

// ===== SINGLE ITEM HOOK ============================================

export function useProcedureMaster(id: number | null) {
  const shouldFetch = typeof id === 'number' && id > 0;

  const url = shouldFetch
    ? buildOPDUrl(OPD_API_CONFIG.PROCEDURE_MASTERS.DETAIL, { id })
    : null;

  const fetcher = async () => {
    if (!shouldFetch) return undefined;

    const record = await getProcedureMasterById(id as number);

    // normalize before returning
    return normalizeProcedureMaster(record);
  };

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<ProcedureMaster | undefined>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 0,
    }
  );

  const isFetching = shouldFetch && (isLoading || isValidating);

  return {
    procedureMaster: data ?? null,
    isLoading: isFetching,
    error,
    mutate,
  };
}

// ===== ACTIVE LIST HOOK (convenience) ==============================

export function useActiveProcedureMasters(category?: string) {
  const params: ProcedureMasterListParams = { is_active: true };
  if (category) params.category = category;

  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.PROCEDURE_MASTERS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureMaster>
  >(
    url,
    async () => {
      const resp = await getProcedureMasters(params);
      return {
        ...resp,
        results: (resp?.results || []).map(normalizeProcedureMaster),
      } as PaginatedResponse<ProcedureMaster>;
    },
    DEFAULT_SWR_OPTIONS
  );

  return {
    procedureMasters: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

// ===== MUTATION HOOKS ==============================================

export function useCreateProcedureMaster() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_MASTERS.CREATE,
    async (_key: string, { arg }: { arg: ProcedureMasterCreateData }) => {
      return await createProcedureMaster(arg);
    }
  );

  return {
    createProcedureMaster: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateProcedureMaster(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.PROCEDURE_MASTERS.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: ProcedureMasterUpdateData }) => {
      return await updateProcedureMaster(id, arg);
    }
  );

  return {
    updateProcedureMaster: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteProcedureMaster() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.PROCEDURE_MASTERS.LIST,
    async (_key: string, { arg }: { arg: number }) => {
      return await deleteProcedureMaster(arg);
    }
  );

  return {
    deleteProcedureMaster: trigger,
    isDeleting: isMutating,
    error,
  };
}
