// src/hooks/opd/index.ts

/**
 * OPD Module Hooks - Barrel Export
 * 
 * This file exports all custom hooks for the OPD (Outpatient Department) module.
 * All hooks use SWR for data fetching and caching.
 */

// Common utilities
export * from './common.hooks';

// Visit hooks
export {
  useVisits,
  useVisit,
  useTodayVisits,
  useQueue,
  useVisitStatistics,
  useCreateVisit,
  useUpdateVisit,
  useDeleteVisit,
  useCallNextPatient,
  useCompleteVisit,
} from './useVisit.hooks';

// OPD Bill hooks
export {
  useOPDBills,
  useOPDBill,
  useCreateOPDBill,
  useUpdateOPDBill,
  useDeleteOPDBill,
  useRecordPayment,
  usePrintOPDBill,
} from './useOPDBill.hooks';

// Clinical Note hooks
export {
  useClinicalNotes,
  useClinicalNote,
  useClinicalNoteByVisit,
  useCreateClinicalNote,
  useUpdateClinicalNote,
  useDeleteClinicalNote,
} from './useClinicalNote.hooks';

// Visit Finding hooks
export {
  useVisitFindings,
  useVisitFinding,
  useFindingsByVisit,
  useLatestVitals,
  useCreateVisitFinding,
  useUpdateVisitFinding,
  useDeleteVisitFinding,
} from './useVisitFinding.hooks';

// Procedure Master hooks
export {
  useProcedureMasters,
  useProcedureMaster,
  useActiveProcedureMasters,
  useCreateProcedureMaster,
  useUpdateProcedureMaster,
  useDeleteProcedureMaster,
} from './useProcedureMaster.hooks';

// Procedure Package hooks
export {
  useProcedurePackages,
  useProcedurePackage,
  useActiveProcedurePackages,
  useCreateProcedurePackage,
  useUpdateProcedurePackage,
  useDeleteProcedurePackage,
} from './useProcedurePackage.hooks';

// Procedure Bill hooks
export {
  useProcedureBills,
  useProcedureBill,
  useProcedureBillItems,
  useProcedureBillItem,
  useCreateProcedureBill,
  useUpdateProcedureBill,
  useDeleteProcedureBill,
  useRecordProcedureBillPayment,
  usePrintProcedureBill,
} from './useProcedureBill.hooks';

// Visit Attachment hooks
export {
  useVisitAttachments,
  useVisitAttachment,
  useAttachmentsByVisit,
  useAttachmentsByType,
  useCreateVisitAttachment,
  useUpdateVisitAttachment,
  useDeleteVisitAttachment,
  useBatchUpload,
} from './useVisitAttachment.hooks';