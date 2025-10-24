// src/hooks/useOPD.ts
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildUrl, buildQueryString } from '@/lib/apiConfig';
import {
  getVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  getTodayVisits,
  getQueue,
  callNextPatient,
  completeVisit,
  getVisitStatistics,
} from '@/services/opd/visit.service';
import {
  getOPDBills,
  getOPDBillById,
  createOPDBill,
  updateOPDBill,
  deleteOPDBill,
  recordPayment,
} from '@/services/opd/opdBill.service';
import {
  getClinicalNotes,
  getClinicalNoteById,
  createClinicalNote,
  updateClinicalNote,
  deleteClinicalNote,
} from '@/services/opd/clinicalNote.service';
import {
  getVisitFindings,
  getVisitFindingById,
  createVisitFinding,
  updateVisitFinding,
  deleteVisitFinding,
} from '@/services/opd/visitFinding.service';
import {
  getProcedureMasters,
  getProcedureMasterById,
  createProcedureMaster,
  updateProcedureMaster,
  deleteProcedureMaster,
} from '@/services/opd/procedureMaster.service';
import {
  getProcedurePackages,
  getProcedurePackageById,
  createProcedurePackage,
  updateProcedurePackage,
  deleteProcedurePackage,
} from '@/services/opd/procedurePackage.service';
import {
  getProcedureBills,
  getProcedureBillById,
  createProcedureBill,
  updateProcedureBill,
  deleteProcedureBill,
  recordProcedureBillPayment,
} from '@/services/opd/procedureBill.service';
import {
  getVisitAttachments,
  getVisitAttachmentById,
  createVisitAttachment,
  updateVisitAttachment,
  deleteVisitAttachment,
} from '@/services/opd/visitAttachment.service';
import type {
  Visit,
  VisitListParams,
  VisitCreateData,
  VisitUpdateData,
  VisitStatistics,
  OPDBill,
  OPDBillListParams,
  OPDBillCreateData,
  OPDBillUpdateData,
  PaymentRecordData,
  ClinicalNote,
  ClinicalNoteListParams,
  ClinicalNoteCreateData,
  ClinicalNoteUpdateData,
  VisitFinding,
  VisitFindingListParams,
  VisitFindingCreateData,
  VisitFindingUpdateData,
  ProcedureMaster,
  ProcedureMasterListParams,
  ProcedureMasterCreateData,
  ProcedureMasterUpdateData,
  ProcedurePackage,
  ProcedurePackageListParams,
  ProcedurePackageCreateData,
  ProcedurePackageUpdateData,
  ProcedureBill,
  ProcedureBillListParams,
  ProcedureBillCreateData,
  ProcedureBillUpdateData,
  VisitAttachment,
  VisitAttachmentListParams,
  VisitAttachmentCreateData,
  VisitAttachmentUpdateData,
  PaginatedResponse,
} from '@/types/opd.types';

// ==================== VISITS HOOKS ====================

/**
 * Hook to fetch paginated visits list with filters
 */
export const useVisits = (params?: VisitListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.OPD.VISITS_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Visit>>(
    url,
    () => getVisits(params),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
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
};

/**
 * Hook to fetch a single visit by ID
 */
export const useVisit = (id: number | null) => {
  const { data, error, isLoading, mutate } = useSWR<Visit>(
    id ? `${API_CONFIG.OPD.VISIT_DETAIL.replace(':id', String(id))}` : null,
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
};

/**
 * Hook to fetch today's visits
 */
export const useTodayVisits = () => {
  const { data, error, isLoading, mutate } = useSWR(
    API_CONFIG.OPD.VISITS_TODAY,
    getTodayVisits,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    todayVisits: data?.data || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to fetch queue status
 */
export const useQueue = () => {
  const { data, error, isLoading, mutate } = useSWR(
    API_CONFIG.OPD.VISITS_QUEUE,
    getQueue,
    {
      revalidateOnFocus: false,
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );

  // Backend returns all waiting/called patients in single array
  // We need to split them by status on the frontend
  const allQueueVisits = Array.isArray(data?.data) ? data.data : [];
  
  const waiting = allQueueVisits.filter((v: Visit) => v.status === 'waiting');
  const called = allQueueVisits.filter((v: Visit) => v.status === 'called');
  const inConsultation = allQueueVisits.filter((v: Visit) => v.status === 'in_consultation');

  return {
    waiting,
    called,
    inConsultation,
    isLoading,
    error,
    mutate,
  };
};


/**
 * Hook to fetch visit statistics
 */
export const useVisitStatistics = (params?: {
  start_date?: string;
  end_date?: string;
}) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.OPD.VISITS_STATISTICS}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: VisitStatistics }>(
    url,
    () => getVisitStatistics(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    statistics: data?.data || null,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to create a new visit
 */
export const useCreateVisit = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD.VISITS_LIST,
    async (_key: string, { arg }: { arg: VisitCreateData }) =>
      await createVisit(arg)
  );

  return {
    createVisit: trigger,
    isCreating: isMutating,
    error,
  };
};

/**
 * Hook to update a visit
 */
export const useUpdateVisit = (id: number) => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD.VISIT_DETAIL.replace(':id', String(id)),
    async (_key: string, { arg }: { arg: VisitUpdateData }) =>
      await updateVisit(id, arg)
  );

  return {
    updateVisit: trigger,
    isUpdating: isMutating,
    error,
  };
};

/**
 * Hook to delete a visit
 */
export const useDeleteVisit = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD.VISITS_LIST,
    async (_key: string, { arg }: { arg: number }) => await deleteVisit(arg)
  );

  return {
    deleteVisit: trigger,
    isDeleting: isMutating,
    error,
  };
};

/**
 * Hook to call next patient
 */
export const useCallNextPatient = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD.VISITS_CALL_NEXT,
    async () => await callNextPatient()
  );

  return {
    callNext: trigger,
    isCalling: isMutating,
    error,
  };
};

/**
 * Hook to complete a visit
 */
export const useCompleteVisit = (id: number) => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD.VISIT_COMPLETE.replace(':id', String(id)),
    async () => await completeVisit(id)
  );

  return {
    completeVisit: trigger,
    isCompleting: isMutating,
    error,
  };
};

// ==================== OPD BILLS HOOKS ====================

/**
 * Hook to fetch paginated OPD bills with filters
 */
export const useOPDBills = (params?: OPDBillListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.OPD_BILLS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<OPDBill>>(
    url,
    () => getOPDBills(params),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
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
};

/**
 * Hook to fetch a single OPD bill by ID
 */
export const useOPDBill = (id: number | null) => {
  const { data, error, isLoading, mutate } = useSWR<OPDBill>(
    id ? `${API_CONFIG.OPD_BILLS.DETAIL.replace(':id', String(id))}` : null,
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
};

/**
 * Hook to create a new OPD bill
 */
export const useCreateOPDBill = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD_BILLS.CREATE,
    async (_key: string, { arg }: { arg: OPDBillCreateData }) =>
      await createOPDBill(arg)
  );

  return {
    createOPDBill: trigger,
    isCreating: isMutating,
    error,
  };
};

/**
 * Hook to update an OPD bill
 */
export const useUpdateOPDBill = (id: number) => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD_BILLS.UPDATE.replace(':id', String(id)),
    async (_key: string, { arg }: { arg: OPDBillUpdateData }) =>
      await updateOPDBill(id, arg)
  );

  return {
    updateOPDBill: trigger,
    isUpdating: isMutating,
    error,
  };
};

/**
 * Hook to delete an OPD bill
 */
export const useDeleteOPDBill = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD_BILLS.LIST,
    async (_key: string, { arg }: { arg: number }) => await deleteOPDBill(arg)
  );

  return {
    deleteOPDBill: trigger,
    isDeleting: isMutating,
    error,
  };
};

/**
 * Hook to record payment for an OPD bill
 */
export const useRecordPayment = (id: number) => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.OPD_BILLS.RECORD_PAYMENT.replace(':id', String(id)),
    async (_key: string, { arg }: { arg: PaymentRecordData }) =>
      await recordPayment(id, arg)
  );

  return {
    recordPayment: trigger,
    isRecording: isMutating,
    error,
  };
};

// ==================== CLINICAL NOTES HOOKS ====================

/**
 * Hook to fetch paginated clinical notes with filters
 */
export const useClinicalNotes = (params?: ClinicalNoteListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.CLINICAL_NOTES.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ClinicalNote>
  >(url, () => getClinicalNotes(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    clinicalNotes: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to fetch a single clinical note by ID
 */
export const useClinicalNote = (id: number | null) => {
  const { data, error, isLoading, mutate } = useSWR<ClinicalNote>(
    id ? `${API_CONFIG.CLINICAL_NOTES.DETAIL.replace(':id', String(id))}` : null,
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
};

/**
 * Hook to create a new clinical note
 */
export const useCreateClinicalNote = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.CLINICAL_NOTES.CREATE,
    async (_key: string, { arg }: { arg: ClinicalNoteCreateData }) =>
      await createClinicalNote(arg)
  );

  return {
    createClinicalNote: trigger,
    isCreating: isMutating,
    error,
  };
};

/**
 * Hook to update a clinical note
 */
export const useUpdateClinicalNote = (id: number) => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.CLINICAL_NOTES.UPDATE.replace(':id', String(id)),
    async (_key: string, { arg }: { arg: ClinicalNoteUpdateData }) =>
      await updateClinicalNote(id, arg)
  );

  return {
    updateClinicalNote: trigger,
    isUpdating: isMutating,
    error,
  };
};

/**
 * Hook to delete a clinical note
 */
export const useDeleteClinicalNote = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.CLINICAL_NOTES.LIST,
    async (_key: string, { arg }: { arg: number }) =>
      await deleteClinicalNote(arg)
  );

  return {
    deleteClinicalNote: trigger,
    isDeleting: isMutating,
    error,
  };
};

// ==================== VISIT FINDINGS HOOKS ====================

/**
 * Hook to fetch paginated visit findings with filters
 */
export const useVisitFindings = (params?: VisitFindingListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.VISIT_FINDINGS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<VisitFinding>
  >(url, () => getVisitFindings(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    visitFindings: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to create a new visit finding
 */
export const useCreateVisitFinding = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.VISIT_FINDINGS.CREATE,
    async (_key: string, { arg }: { arg: VisitFindingCreateData }) =>
      await createVisitFinding(arg)
  );

  return {
    createVisitFinding: trigger,
    isCreating: isMutating,
    error,
  };
};

// ==================== PROCEDURE MASTERS HOOKS ====================

/**
 * Hook to fetch paginated procedure masters with filters
 */
export const useProcedureMasters = (params?: ProcedureMasterListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.PROCEDURE_MASTERS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureMaster>
  >(url, () => getProcedureMasters(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    procedureMasters: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// ==================== PROCEDURE PACKAGES HOOKS ====================

/**
 * Hook to fetch paginated procedure packages with filters
 */
export const useProcedurePackages = (params?: ProcedurePackageListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.PROCEDURE_PACKAGES.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedurePackage>
  >(url, () => getProcedurePackages(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    procedurePackages: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// ==================== PROCEDURE BILLS HOOKS ====================

/**
 * Hook to fetch paginated procedure bills with filters
 */
export const useProcedureBills = (params?: ProcedureBillListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.PROCEDURE_BILLS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ProcedureBill>
  >(url, () => getProcedureBills(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    procedureBills: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// ==================== VISIT ATTACHMENTS HOOKS ====================

/**
 * Hook to fetch paginated visit attachments with filters
 */
export const useVisitAttachments = (params?: VisitAttachmentListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.VISIT_ATTACHMENTS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<VisitAttachment>
  >(url, () => getVisitAttachments(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    visitAttachments: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to create a new visit attachment
 */
export const useCreateVisitAttachment = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.VISIT_ATTACHMENTS.CREATE,
    async (_key: string, { arg }: { arg: VisitAttachmentCreateData }) =>
      await createVisitAttachment(arg)
  );

  return {
    createVisitAttachment: trigger,
    isCreating: isMutating,
    error,
  };
};