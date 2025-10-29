// src/hooks/opd/useClinicalNote.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import {
  getClinicalNotes,
  getClinicalNoteById,
  createClinicalNote,
  updateClinicalNote,
  deleteClinicalNote,
} from '@/services/opd/clinicalNote.service';
import { DEFAULT_SWR_OPTIONS, buildQueryString } from './common.hooks';
import type {
  ClinicalNote,
  ClinicalNoteListParams,
  ClinicalNoteCreateData,
  ClinicalNoteUpdateData,
  PaginatedResponse,
} from '@/types/opd';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated clinical notes with filters
 * 
 * @example
 * const { clinicalNotes, count, isLoading } = useClinicalNotes({ 
 *   visit: 123 
 * });
 */
export function useClinicalNotes(params?: ClinicalNoteListParams) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.CLINICAL_NOTES.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ClinicalNote>
  >(url, () => getClinicalNotes(params), DEFAULT_SWR_OPTIONS);

  return {
    clinicalNotes: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single clinical note by ID
 * 
 * @example
 * const { clinicalNote, isLoading, mutate } = useClinicalNote(123);
 */
export function useClinicalNote(id: number | null) {
  const url = id
    ? buildOPDUrl(OPD_API_CONFIG.CLINICAL_NOTES.DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<ClinicalNote>(
    url,
    () => (id ? getClinicalNoteById(id) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    clinicalNote: data || null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch clinical note by visit ID
 * Useful for getting the clinical note associated with a specific visit
 * 
 * @example
 * const { clinicalNote, isLoading } = useClinicalNoteByVisit(123);
 */
export function useClinicalNoteByVisit(visitId: number | null) {
  const queryString = visitId ? buildQueryString({ visit: visitId }) : '';
  const url = visitId
    ? `${OPD_API_CONFIG.CLINICAL_NOTES.LIST}${queryString}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ClinicalNote>
  >(
    url,
    () => (visitId ? getClinicalNotes({ visit: visitId }) : null),
    {
      revalidateOnFocus: false,
    }
  );

  // Clinical notes have OneToOne relationship with visits
  // So there should only be one result
  const clinicalNote = data?.results?.[0] || null;

  return {
    clinicalNote,
    isLoading,
    error,
    mutate,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new clinical note
 * 
 * @example
 * const { createClinicalNote, isCreating, error } = useCreateClinicalNote();
 * await createClinicalNote({
 *   visit: 123,
 *   present_complaints: 'Fever and cough',
 *   diagnosis: 'Upper respiratory infection',
 *   treatment_plan: 'Antibiotics for 7 days',
 * });
 */
export function useCreateClinicalNote() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.CLINICAL_NOTES.CREATE,
    async (_key: string, { arg }: { arg: ClinicalNoteCreateData }) =>
      await createClinicalNote(arg)
  );

  return {
    createClinicalNote: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook to update a clinical note
 * 
 * @example
 * const { updateClinicalNote, isUpdating, error } = useUpdateClinicalNote(123);
 * await updateClinicalNote({ 
 *   treatment_plan: 'Extended treatment for 10 days' 
 * });
 */
export function useUpdateClinicalNote(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.CLINICAL_NOTES.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: ClinicalNoteUpdateData }) =>
      await updateClinicalNote(id, arg)
  );

  return {
    updateClinicalNote: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook to delete a clinical note
 * 
 * @example
 * const { deleteClinicalNote, isDeleting, error } = useDeleteClinicalNote();
 * await deleteClinicalNote(123);
 */
export function useDeleteClinicalNote() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.CLINICAL_NOTES.LIST,
    async (_key: string, { arg }: { arg: number }) =>
      await deleteClinicalNote(arg)
  );

  return {
    deleteClinicalNote: trigger,
    isDeleting: isMutating,
    error,
  };
}