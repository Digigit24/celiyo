// src/types/opd.types.ts

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// VISIT TYPES
// ============================================================================

export type VisitType = 'new' | 'follow_up' | 'emergency';
export type VisitStatus = 'waiting' | 'called' | 'in_consultation' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Visit {
  id: number;
  visit_number: string;
  patient: number;
  patient_name?: string;
  patient_id?: string;
  patient_details?: {
    patient_id: string;
    full_name: string;
    age: number;
    gender: string;
    blood_group: string;
    mobile: string;
  };
  doctor: number | null;
  doctor_name?: string;
  doctor_details?: {
    id: number;
    full_name: string;
    specialties: string[];
    consultation_fee: string;
    follow_up_fee: string;
  };
  appointment: number | null;
  referred_by: number | null;
  referred_by_name?: string;
  created_by: number | null;
  created_by_name?: string;
  visit_date: string;
  visit_type: VisitType;
  entry_time: string;
  is_follow_up: boolean;
  status: VisitStatus;
  queue_position: number | null;
  consultation_start_time: string | null;
  consultation_end_time: string | null;
  payment_status: PaymentStatus;
  total_amount: string;
  paid_amount: string;
  balance_amount: string;
  waiting_time?: number | null;
  has_opd_bill?: boolean;
  has_clinical_note?: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitListParams {
  page?: number;
  patient?: number;
  doctor?: number;
  status?: VisitStatus;
  payment_status?: PaymentStatus;
  visit_type?: VisitType;
  visit_date?: string;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface VisitCreateData {
  patient: number;
  doctor?: number;
  appointment?: number;
  visit_type: VisitType;
  is_follow_up?: boolean;
  referred_by?: number;
  status?: VisitStatus;
  queue_position?: number;
}

export interface VisitUpdateData extends Partial<VisitCreateData> {}

export interface VisitStatistics {
  total_visits: number;
  waiting: number;
  in_consultation: number;
  completed: number;
  cancelled: number;
  no_show: number;
  total_revenue: string;
  pending_amount: string;
}

// ============================================================================
// OPD BILL TYPES
// ============================================================================

export type OPDType = 'consultation' | 'follow_up' | 'emergency';
export type ChargeType = 'first_visit' | 'revisit' | 'emergency';
export type PaymentMode = 'cash' | 'card' | 'upi' | 'bank' | 'multiple';

export interface OPDBill {
  id: number;
  visit: number;
  visit_number?: string;
  bill_number: string;
  bill_date: string;
  patient_name?: string;
  doctor: number;
  doctor_name?: string;
  opd_type: OPDType;
  opd_subtype: string;
  charge_type: ChargeType;
  diagnosis: string;
  remarks: string;
  total_amount: string;
  discount_percent: string;
  discount_amount: string;
  payable_amount: string;
  payment_mode: PaymentMode;
  payment_details: string;
  received_amount: string;
  balance_amount: string;
  payment_status: PaymentStatus;
  billed_by: number | null;
  billed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface OPDBillListParams {
  page?: number;
  visit?: number;
  doctor?: number;
  payment_status?: PaymentStatus;
  opd_type?: OPDType;
  bill_date?: string;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface OPDBillCreateData {
  visit: number;
  doctor: number;
  opd_type: OPDType;
  opd_subtype?: string;
  charge_type: ChargeType;
  diagnosis?: string;
  remarks?: string;
  total_amount: string;
  discount_percent?: string;
  payment_mode?: PaymentMode;
  payment_details?: string;
  received_amount?: string;
}

export interface OPDBillUpdateData extends Partial<OPDBillCreateData> {}

export interface PaymentRecordData {
  amount: string;
  payment_mode: PaymentMode;
  payment_details?: string;
}

// ============================================================================
// PROCEDURE MASTER TYPES
// ============================================================================

export interface ProcedureMaster {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  department: string;
  charge_amount: string;
  is_active: boolean;
  requires_consent: boolean;
  estimated_duration: number | null;
  special_instructions: string;
  created_at: string;
  updated_at: string;
}

export interface ProcedureMasterListParams {
  page?: number;
  category?: string;
  department?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ProcedureMasterCreateData {
  code: string;
  name: string;
  category: string;
  description?: string;
  department?: string;
  charge_amount: string;
  is_active?: boolean;
  requires_consent?: boolean;
  estimated_duration?: number;
  special_instructions?: string;
}

export interface ProcedureMasterUpdateData extends Partial<ProcedureMasterCreateData> {}

// ============================================================================
// PROCEDURE PACKAGE TYPES
// ============================================================================

export interface ProcedurePackageItem {
  procedure_id: number;
  procedure_name?: string;
  procedure_charge?: string;
}

export interface ProcedurePackage {
  id: number;
  package_code: string;
  package_name: string;
  description: string;
  procedures: ProcedurePackageItem[];
  total_individual_cost: string;
  package_price: string;
  discount_percent: string;
  savings: string;
  is_active: boolean;
  validity_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProcedurePackageListParams {
  page?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ProcedurePackageCreateData {
  package_code: string;
  package_name: string;
  description?: string;
  procedure_ids: number[];
  package_price: string;
  is_active?: boolean;
  validity_days?: number;
}

export interface ProcedurePackageUpdateData extends Partial<ProcedurePackageCreateData> {}

// ============================================================================
// PROCEDURE BILL TYPES
// ============================================================================

export interface ProcedureBillItem {
  id: number;
  procedure_bill: number;
  procedure: number;
  procedure_name?: string;
  procedure_code?: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  notes: string;
}

export interface ProcedureBill {
  id: number;
  bill_number: string;
  visit: number;
  visit_number?: string;
  patient_name?: string;
  bill_date: string;
  package: number | null;
  package_name?: string;
  items: ProcedureBillItem[];
  subtotal: string;
  discount_percent: string;
  discount_amount: string;
  tax_percent: string;
  tax_amount: string;
  total_amount: string;
  payment_mode: PaymentMode;
  payment_details: string;
  received_amount: string;
  balance_amount: string;
  payment_status: PaymentStatus;
  remarks: string;
  billed_by: number | null;
  billed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcedureBillListParams {
  page?: number;
  visit?: number;
  payment_status?: PaymentStatus;
  bill_date?: string;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ProcedureBillItemCreateData {
  procedure: number;
  quantity: number;
  unit_price: string;
  notes?: string;
}

export interface ProcedureBillCreateData {
  visit: number;
  package?: number;
  items: ProcedureBillItemCreateData[];
  discount_percent?: string;
  tax_percent?: string;
  payment_mode?: PaymentMode;
  payment_details?: string;
  received_amount?: string;
  remarks?: string;
}

export interface ProcedureBillUpdateData {
  items?: ProcedureBillItemCreateData[];
  discount_percent?: string;
  tax_percent?: string;
  payment_mode?: PaymentMode;
  payment_details?: string;
  received_amount?: string;
  remarks?: string;
}

// ============================================================================
// CLINICAL NOTE TYPES
// ============================================================================

export interface ClinicalNote {
  id: number;
  visit: number;
  visit_number?: string;
  patient_name?: string;
  note_date: string;
  ehr_number: string;
  present_complaints: string;
  observation: string;
  diagnosis: string;
  investigation: string;
  treatment_plan: string;
  medicines_prescribed: string;
  doctor_advice: string;
  suggested_surgery_name: string;
  suggested_surgery_reason: string;
  referred_doctor: number | null;
  referred_doctor_name?: string;
  next_followup_date: string | null;
  created_by: number | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicalNoteListParams {
  page?: number;
  visit?: number;
  note_date?: string;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ClinicalNoteCreateData {
  visit: number;
  ehr_number?: string;
  present_complaints?: string;
  observation?: string;
  diagnosis?: string;
  investigation?: string;
  treatment_plan?: string;
  medicines_prescribed?: string;
  doctor_advice?: string;
  suggested_surgery_name?: string;
  suggested_surgery_reason?: string;
  referred_doctor?: number;
  next_followup_date?: string;
}

export interface ClinicalNoteUpdateData extends Partial<ClinicalNoteCreateData> {}

// ============================================================================
// FINDING TYPES
// ============================================================================

// Types of findings recorded during a visit
export type FindingType =
  | 'vital_signs'
  | 'physical_examination'
  | 'symptoms'
  | 'general_observation'
  | 'system_examination';

// Full Finding record returned from API
export interface Finding {
  id: number;
  visit_id: number;              // maps to old `visit`
  finding_type: FindingType;     // was 'examination' | 'investigation'
  recorded_at: string;           // replaces old `finding_date`
  recorded_by?: string;          // old had recorded_by (number) + recorded_by_name

  // Vital Signs (were: temperature, pulse, bp_systolic, etc.)
  temperature?: string | null;
  blood_pressure_systolic?: string | null;   // old bp_systolic (number | null)
  blood_pressure_diastolic?: string | null;  // old bp_diastolic (number | null)
  pulse_rate?: string | null;                // old pulse (number | null)
  respiratory_rate?: string | null;         // stays (was number | null, now string)
  oxygen_saturation?: string | null;        // old spo2
  weight?: string | null;
  height?: string | null;
  bmi?: string | null;
  pain_scale?: string | null;

  // Physical Examination (old had tongue, throat, cns, rs, cvs, pa)
  general_appearance?: string | null;
  consciousness_level?: string | null;
  skin_condition?: string | null;
  head_neck?: string | null;
  cardiovascular?: string | null;           // old cvs
  respiratory?: string | null;              // old rs
  abdomen?: string | null;                  // old pa
  extremities?: string | null;
  neurological?: string | null;             // old cns

  // Additional Fields
  findings_notes?: string | null;
  abnormalities?: string | null;

  // Metadata (keep created/updated like before)
  created_at: string;
  updated_at?: string;
}

// Query params when listing/filtering findings (like VisitFindingListParams)
export interface FindingListParams {
  page?: number;
  visit_id?: number;            // old: visit
  finding_type?: FindingType;
  recorded_at?: string;         // old: finding_date
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

// Data required to create a new Finding
// mirrors Finding but only what's allowed to POST
// keep fields optional like in VisitFindingCreateData
export interface FindingCreateData {
  visit_id: number;
  finding_type: FindingType;
  recorded_at: string;

  // Vital Signs (optional)
  temperature?: string;
  blood_pressure_systolic?: string;
  blood_pressure_diastolic?: string;
  pulse_rate?: string;
  respiratory_rate?: string;
  oxygen_saturation?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  pain_scale?: string;

  // Physical Examination (optional)
  general_appearance?: string;
  consciousness_level?: string;
  skin_condition?: string;
  head_neck?: string;
  cardiovascular?: string;
  respiratory?: string;
  abdomen?: string;
  extremities?: string;
  neurological?: string;

  // Additional Fields (optional)
  findings_notes?: string;
  abnormalities?: string;
}

// PATCH body uses Partial of create (same pattern you had)
export interface FindingUpdateData extends Partial<FindingCreateData> {}

// Slim version for list/table/preview cards
// This didn’t exist in old code but it's in your new model, so we keep it.
export interface FindingSummary {
  id: number;
  visit_id: number;
  finding_type: FindingType;
  recorded_at: string;
  has_abnormalities: boolean;
  vital_signs_summary?: string; // e.g. "BP 120/80, Temp 98.6°F"
}

// ============================================================================
// VISIT ATTACHMENT TYPES
// ============================================================================

export type FileType = 'xray' | 'report' | 'prescription' | 'scan' | 'document' | 'other';

export interface VisitAttachment {
  id: number;
  visit: number;
  visit_number?: string;
  file: string;
  file_name: string;
  file_type: FileType;
  file_size?: string;
  file_extension?: string;
  description: string;
  uploaded_by: number | null;
  uploaded_by_name?: string;
  uploaded_at: string;
}

export interface VisitAttachmentListParams {
  page?: number;
  visit?: number;
  file_type?: FileType;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface VisitAttachmentCreateData {
  visit: number;
  file: File;
  file_type: FileType;
  description?: string;
}

export interface VisitAttachmentUpdateData {
  file_type?: FileType;
  description?: string;
}