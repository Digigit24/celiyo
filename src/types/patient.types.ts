// src/types/patient.types.ts (UPDATED - add missing fields)
// ==================== PATIENT TYPES ====================
// Complete type definitions for Patient module
// Matches Django backend fields exactly (snake_case)
// DO NOT change field names - they must match API response!

// ==================== ENUMS & CONSTANTS ====================
export type PatientGender = 'male' | 'female' | 'other';
export type PatientStatus = 'active' | 'inactive' | 'deceased';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';
export type AllergyType = 'drug' | 'food' | 'environmental' | 'contact' | 'other';
export type MedicalHistoryStatus = 'active' | 'resolved' | 'chronic';

// ==================== MAIN PATIENT INTERFACE (LIST VIEW) ====================
// This matches the ACTUAL API response from /api/patients/patients/
export interface PatientProfile {
  id: number;
  patient_id: string;
  full_name: string;
  age: number;
  gender: PatientGender;
  mobile_primary: string;
  email: string | null;
  blood_group: BloodGroup | null;
  city: string | null;
  status: PatientStatus;
  registration_date: string;
  last_visit_date: string | null;
  total_visits: number;
  is_insurance_valid: boolean;
}

// ==================== DETAILED PATIENT INTERFACE (DETAIL VIEW) ====================
export interface PatientDetail {
  id: number;
  patient_id: string;
  user: number | null;
  
  // Personal Info
  first_name: string;
  last_name: string;
  middle_name: string | null;
  full_name: string;
  date_of_birth: string;
  age: number;
  gender: PatientGender;
  
  // Contact
  mobile_primary: string;
  mobile_secondary: string | null;
  email: string | null;
  
  // Address
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  full_address: string;
  
  // Medical
  blood_group: BloodGroup | null;
  height: string | null; // Decimal in cm
  weight: string | null; // Decimal in kg
  bmi: string | null;
  
  // Social
  marital_status: MaritalStatus | null;
  occupation: string | null;
  
  // Emergency Contact
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  
  // Insurance
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  insurance_expiry_date: string | null;
  is_insurance_valid: boolean;
  
  // Hospital
  registration_date: string;
  last_visit_date: string | null;
  total_visits: number;
  status: PatientStatus;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: number | null;
}

// ==================== LIST FILTERS ====================
export interface PatientListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: PatientStatus;
  gender?: PatientGender;
  blood_group?: BloodGroup;
  has_insurance?: boolean;
  city?: string;
  state?: string;
  age_min?: number;
  age_max?: number;
  date_from?: string;
  date_to?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

// ==================== CREATE/UPDATE DATA ====================
export interface PatientCreateData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: PatientGender;
  mobile_primary: string;
  
  middle_name?: string | null;
  user?: number | null;
  blood_group?: BloodGroup | null;
  marital_status?: MaritalStatus | null;
  mobile_secondary?: string | null;
  email?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string;
  height?: string | null;
  weight?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  occupation?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  insurance_expiry_date?: string | null;
  status?: PatientStatus;
}

export interface PatientUpdateData extends Partial<PatientCreateData> {}

// ==================== VITALS ====================
export interface PatientVitals {
  id: number;
  patient: number;
  recorded_at: string;
  temperature: string | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  blood_pressure: string | null; // Computed field "120/80"
  heart_rate: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: string | null;
  blood_glucose: string | null;
  notes: string | null;
  recorded_by: number | null;
}

export interface VitalsCreateData {
  patient: number;
  temperature?: string | null;
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  heart_rate?: number | null;
  respiratory_rate?: number | null;
  oxygen_saturation?: string | null;
  blood_glucose?: string | null;
  notes?: string | null;
}

// ==================== ALLERGIES ====================
export interface PatientAllergy {
  id: number;
  patient: number;
  allergy_type: AllergyType;
  allergen: string;
  severity: AllergySeverity;
  symptoms: string;
  treatment: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  recorded_by: number | null;
}

export interface AllergyCreateData {
  patient: number;
  allergy_type: AllergyType;
  allergen: string;
  severity: AllergySeverity;
  symptoms: string;
  treatment?: string | null;
  is_active?: boolean;
}

export interface AllergyUpdateData extends Partial<AllergyCreateData> {}

// ==================== MEDICAL HISTORY ====================
export interface PatientMedicalHistory {
  id: number;
  patient: number;
  condition: string;
  diagnosed_date: string | null;
  status: MedicalHistoryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalHistoryCreateData {
  patient: number;
  condition: string;
  diagnosed_date?: string | null;
  status?: MedicalHistoryStatus;
  notes?: string | null;
}

export interface MedicalHistoryUpdateData extends Partial<MedicalHistoryCreateData> {}

// ==================== MEDICATIONS ====================
export interface PatientMedication {
  id: number;
  patient: number;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  prescribed_by: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationCreateData {
  patient: number;
  medication_name: string;
  dosage?: string | null;
  frequency?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  prescribed_by?: string | null;
  is_active?: boolean;
  notes?: string | null;
}

export interface MedicationUpdateData extends Partial<MedicationCreateData> {}

// ==================== API RESPONSE WRAPPERS ====================
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

// ==================== STATISTICS ====================
export interface PatientStatistics {
  total_patients: number;
  active_patients: number;
  inactive_patients: number;
  new_patients_this_month: number;
  patients_by_gender: {
    male: number;
    female: number;
    other: number;
  };
  patients_by_age_group: {
    [key: string]: number;
  };
  patients_with_insurance: number;
}