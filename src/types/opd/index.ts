// src/types/opd/index.ts

/**
 * OPD Module Type Definitions - Barrel Export
 * 
 * This file exports all type definitions for the OPD (Outpatient Department) module.
 * All types are 100% matched with Django backend models and serializers.
 */

// Common API Response Types
export type {
  ApiResponse,
  PaginatedResponse,
  BaseListParams,
} from './common.types';

// Visit Types
export type {
  VisitType,
  VisitStatus,
  PaymentStatus,
  Visit,
  VisitListParams,
  VisitCreateData,
  VisitUpdateData,
  VisitStatistics,
  QueueStatus,
} from './visit.types';

// OPD Bill Types
export type {
  OPDType,
  ChargeType,
  PaymentMode,
  OPDBill,
  OPDBillListParams,
  OPDBillCreateData,
  OPDBillUpdateData,
} from './opdBill.types';

// Re-export PaymentRecordData from opdBill (also used in procedureBill)
export type { PaymentRecordData } from './opdBill.types';

// Procedure Master Types
export type {
  ProcedureCategory,
  ProcedureMaster,
  ProcedureMasterListParams,
  ProcedureMasterCreateData,
  ProcedureMasterUpdateData,
} from './procedureMaster.types';

// Procedure Package Types
export type {
  ProcedurePackage,
  ProcedureMasterInfo,
  ProcedurePackageListParams,
  ProcedurePackageCreateData,
  ProcedurePackageUpdateData,
} from './procedurePackage.types';

// Procedure Bill Types
export type {
  BillType,
  ProcedureBill,
  ProcedureBillItem,
  ProcedureBillListParams,
  ProcedureBillItemCreateData,
  ProcedureBillCreateData,
  ProcedureBillUpdateData,
} from './procedureBill.types';

// Clinical Note Types
export type {
  ClinicalNote,
  ClinicalNoteListParams,
  ClinicalNoteCreateData,
  ClinicalNoteUpdateData,
} from './clinicalNote.types';

// Visit Finding Types
export type {
  FindingType,
  VisitFinding,
  VisitFindingListParams,
  VisitFindingCreateData,
  VisitFindingUpdateData,
} from './visitFinding.types';

// Visit Attachment Types
export type {
  FileType,
  VisitAttachment,
  VisitAttachmentListParams,
  VisitAttachmentCreateData,
  VisitAttachmentUpdateData,
} from './visitAttachment.types';