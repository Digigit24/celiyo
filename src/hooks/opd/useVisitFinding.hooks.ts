// src/hooks/opd/useVisitFinding.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildUrl } from '@/lib/apiConfig';
import {
  getFindings,
  getFindingById,
  createFinding,
  updateFinding,
  deleteFinding,
} from '@/services/opd/findings.service';
import { DEFAULT_SWR_OPTIONS, buildQueryString } from './common.hooks';
import type {
  VisitFinding  as Finding,
  VisitFindingListParams as  FindingListParams,
  VisitFindingCreateData as FindingCreateData,
  VisitFindingUpdateData as  FindingUpdateData,
  PaginatedResponse,
} from '@/types/opd';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated visit findings with filters
 * 
 * @example
 * const { findings, count, isLoading } = useVisitFindings({ 
 *   visit_id: 123,
 *   finding_type: 'vital_signs' 
 * });
 */
export function useVisitFindings(params?: FindingListParams) {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.VISIT_FINDINGS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<Finding>
  >(url, () => getFindings(params), DEFAULT_SWR_OPTIONS);

  return {
    findings: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single visit finding by ID
 * 
 * @example
 * const { finding, isLoading, mutate } = useVisitFinding(123);
 */
export function useVisitFinding(id: number | null) {
  const url = id ? buildUrl(API_CONFIG.VISIT_FINDINGS.DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<Finding>(
    url,
    () => (id ? getFindingById(id) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    finding: data || null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch findings for a specific visit
 * Returns all findings (vital signs, physical exam, etc.) for a visit
 * 
 * @example
 * const { findings, isLoading } = useFindingsByVisit(123);
 */
export function useFindingsByVisit(visitId: number | null) {
  const queryString = visitId ? buildQueryString({ visit_id: visitId }) : '';
  const url = visitId
    ? `${API_CONFIG.VISIT_FINDINGS.LIST}${queryString}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<Finding>
  >(
    url,
    () => (visitId ? getFindings({ visit_id: visitId }) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    findings: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch latest vital signs for a visit
 * Returns the most recent vital signs finding for a visit
 * 
 * @example
 * const { vitals, isLoading } = useLatestVitals(123);
 */
export function useLatestVitals(visitId: number | null) {
  const queryString = visitId
    ? buildQueryString({
        visit_id: visitId,
        finding_type: 'vital_signs',
        ordering: '-recorded_at',
      })
    : '';
  const url = visitId
    ? `${API_CONFIG.VISIT_FINDINGS.LIST}${queryString}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<Finding>
  >(
    url,
    () =>
      visitId
        ? getFindings({
            visit_id: visitId,
            visitfinding_type: 'vital_signs',
            ordering: '-recorded_at',
          })
        : null,
    {
      revalidateOnFocus: false,
    }
  );

  // Get the most recent vital signs
  const vitals = data?.results?.[0] || null;

  return {
    vitals,
    isLoading,
    error,
    mutate,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new visit finding
 * 
 * @example
 * const { createFinding, isCreating, error } = useCreateVisitFinding();
 * await createFinding({
 *   visit_id: 123,
 *   finding_type: 'vital_signs',
 *   temperature: '98.6',
 *   pulse_rate: '72',
 *   blood_pressure_systolic: '120',
 *   blood_pressure_diastolic: '80',
 * });
 */
export function useCreateVisitFinding() {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.VISIT_FINDINGS.CREATE,
    async (_key: string, { arg }: { arg: FindingCreateData }) =>
      await createFinding(arg)
  );

  return {
    createFinding: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook to update a visit finding
 * 
 * @example
 * const { updateFinding, isUpdating, error } = useUpdateVisitFinding(123);
 * await updateFinding({ 
 *   temperature: '99.2',
 *   findings_notes: 'Slight fever noted' 
 * });
 */
export function useUpdateVisitFinding(id: number) {
  const url = buildUrl(API_CONFIG.VISIT_FINDINGS.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: FindingUpdateData }) =>
      await updateFinding(id, arg)
  );

  return {
    updateFinding: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook to delete a visit finding
 * 
 * @example
 * const { deleteFinding, isDeleting, error } = useDeleteVisitFinding();
 * await deleteFinding(123);
 */
export function useDeleteVisitFinding() {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.VISIT_FINDINGS.LIST,
    async (_key: string, { arg }: { arg: number }) => await deleteFinding(arg)
  );

  return {
    deleteFinding: trigger,
    isDeleting: isMutating,
    error,
  };
}