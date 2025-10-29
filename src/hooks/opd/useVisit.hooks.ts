// src/hooks/opd/useVisit.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import {
  getVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  getTodayVisits,
  getQueue,
  getVisitQueue,
  callNextPatient,
  completeVisit,
  getVisitStatistics,
} from '@/services/opd/visit.service';
import {
  DEFAULT_SWR_OPTIONS,
  REALTIME_SWR_OPTIONS,
  QUEUE_SWR_OPTIONS,
  buildQueryString,
} from './common.hooks';
import type {
  Visit,
  VisitListParams,
  VisitCreateData,
  VisitUpdateData,
  VisitStatistics,
  QueueStatus,
  PaginatedResponse,
} from '@/types/opd';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated visits list with filters
 * 
 * @example
 * const { visits, count, isLoading, mutate } = useVisits({ 
 *   status: 'waiting',
 *   page: 1 
 * });
 */
export function useVisits(params?: VisitListParams) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.VISITS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Visit>>(
    url,
    () => getVisits(params),
    DEFAULT_SWR_OPTIONS
  );

  return {
    visits: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single visit by ID
 * 
 * @example
 * const { visit, isLoading, mutate } = useVisit(123);
 */
export function useVisit(id: number | null) {
  const url = id ? buildOPDUrl(OPD_API_CONFIG.VISITS.DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<Visit>(
    url,
    () => (id ? getVisitById(id) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    visit: data || null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch today's visits with auto-refresh
 * Refreshes every 30 seconds automatically
 * 
 * @example
 * const { todayVisits, count, isLoading } = useTodayVisits();
 */
export function useTodayVisits() {
  const { data, error, isLoading, mutate } = useSWR<Visit[]>(
    OPD_API_CONFIG.VISITS.TODAY,
    getTodayVisits,
    REALTIME_SWR_OPTIONS
  );

  return {
    todayVisits: data || [],
    count: data?.length || 0,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch queue status with auto-refresh
 * Refreshes every 10 seconds automatically
 * Returns visits grouped by status: waiting, called, in_consultation
 * 
 * @example
 * const { waiting, called, inConsultation, isLoading } = useQueue();
 */
export function useQueue() {
  const { data, error, isLoading, mutate } = useSWR<QueueStatus>(
    OPD_API_CONFIG.VISITS.QUEUE,
    getVisitQueue,
    QUEUE_SWR_OPTIONS
  );

  return {
    waiting: data?.waiting || [],
    called: data?.called || [],
    inConsultation: data?.in_consultation || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch visit statistics for a date range
 * 
 * @example
 * const { statistics, isLoading } = useVisitStatistics({ 
 *   start_date: '2025-01-01',
 *   end_date: '2025-01-31' 
 * });
 */
export function useVisitStatistics(params?: {
  start_date?: string;
  end_date?: string;
}) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.VISITS.STATISTICS}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<VisitStatistics>(
    url,
    () => getVisitStatistics('day'),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    statistics: data || null,
    isLoading,
    error,
    mutate,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new visit
 * 
 * @example
 * const { createVisit, isCreating, error } = useCreateVisit();
 * await createVisit({ patient: 123, visit_type: 'new' });
 */
export function useCreateVisit() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.VISITS.CREATE,
    async (_key: string, { arg }: { arg: VisitCreateData }) =>
      await createVisit(arg)
  );

  return {
    createVisit: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook to update a visit
 * 
 * @example
 * const { updateVisit, isUpdating, error } = useUpdateVisit(123);
 * await updateVisit({ status: 'completed' });
 */
export function useUpdateVisit(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.VISITS.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: VisitUpdateData }) =>
      await updateVisit(id, arg)
  );

  return {
    updateVisit: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook to delete a visit
 * 
 * @example
 * const { deleteVisit, isDeleting, error } = useDeleteVisit();
 * await deleteVisit(123);
 */
export function useDeleteVisit() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.VISITS.LIST,
    async (_key: string, { arg }: { arg: number }) => await deleteVisit(arg)
  );

  return {
    deleteVisit: trigger,
    isDeleting: isMutating,
    error,
  };
}

// ==================== ACTION HOOKS ====================

/**
 * Hook to call the next patient in queue
 * 
 * @example
 * const { callNext, isCalling, error } = useCallNextPatient();
 * const result = await callNext();
 * // result.data will contain the called visit or null if queue is empty
 */
export function useCallNextPatient() {
  const { trigger, isMutating, error, data } = useSWRMutation(
    OPD_API_CONFIG.VISITS.CALL_NEXT,
    async () => await callNextPatient()
  );

  return {
    callNext: trigger,
    isCalling: isMutating,
    error,
    result: data,
  };
}

/**
 * Hook to complete a visit
 * 
 * @example
 * const { completeVisit, isCompleting, error } = useCompleteVisit(123);
 * await completeVisit();
 */
export function useCompleteVisit(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.VISITS.COMPLETE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async () => await completeVisit(id)
  );

  return {
    completeVisit: trigger,
    isCompleting: isMutating,
    error,
  };
}