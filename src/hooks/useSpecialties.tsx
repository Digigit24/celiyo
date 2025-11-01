// src/hooks/useSpecialties.tsx
// ==================== SPECIALTY HOOKS (TSX) ====================
// Mirrors your Patient hooks pattern (SWR + SWRMutation)

import * as React from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildQueryString } from '@/lib/apiConfig';
import {
  createSpecialty as createSpecialtyApi,
  updateSpecialty as updateSpecialtyApi,
  deleteSpecialty as deleteSpecialtyApi,
} from '@/services/doctor.service';
import type { Specialty, SpecialtyListParams, PaginatedResponse } from '@/types/doctor.types';

// ==================== SPECIALTY LIST HOOK ====================

/**
 * Fetch list of specialties with filters & pagination.
 * Keeps previous page data while loading the next set.
 *
 * @example
 * const { specialties, count, isLoading, error, mutate } = useSpecialties({
 *   search: 'cardio',
 *   is_active: true,
 *   page: 1,
 *   page_size: 20,
 * });
 */
export const useSpecialties = (params?: SpecialtyListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.DOCTORS.SPECIALTIES_LIST}${queryString}`;

  // Rely on your global SWR fetcher (same as Patient hooks)
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Specialty>>(url, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    specialties: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// ==================== CREATE SPECIALTY HOOK ====================

/**
 * Create a new specialty (POST).
 *
 * @example
 * const { trigger: createSpec, isMutating } = useCreateSpecialty();
 * await createSpec({ name: 'Cardiology', code: 'CARD', is_active: true });
 */
export const useCreateSpecialty = () => {
  const { trigger, isMutating, error, data } = useSWRMutation(
    API_CONFIG.DOCTORS.SPECIALTY_CREATE,
    (_key, { arg }: { arg: Partial<Specialty> }) => createSpecialtyApi(arg)
  );

  return { trigger, isMutating, error, data };
};

// ==================== UPDATE SPECIALTY HOOK ====================

/**
 * Update an existing specialty (PATCH).
 *
 * @example
 * const { trigger: updateSpec, isMutating } = useUpdateSpecialty(12);
 * await updateSpec({ name: 'Interventional Cardiology' });
 */
export const useUpdateSpecialty = (id: number) => {
  const url = API_CONFIG.DOCTORS.SPECIALTY_UPDATE.replace(':id', String(id));

  const { trigger, isMutating, error, data } = useSWRMutation(
    url,
    (_key, { arg }: { arg: Partial<Specialty> }) => updateSpecialtyApi(id, arg)
  );

  return { trigger, isMutating, error, data };
};

// ==================== DELETE SPECIALTY HOOK ====================

/**
 * Delete a specialty (DELETE).
 *
 * @example
 * const { trigger: deleteSpec } = useDeleteSpecialty();
 * await deleteSpec(12);
 */
export const useDeleteSpecialty = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.DOCTORS.SPECIALTY_DELETE,
    (_key, { arg }: { arg: number }) => deleteSpecialtyApi(arg)
  );

  return { trigger, isMutating, error };
};
